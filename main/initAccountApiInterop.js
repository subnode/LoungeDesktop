import * as ipc from './lib/ipc';
import LdError from './lib/Error';
import storeAccounts from './stores/storeAccounts';
import storePreferences from './stores/storePreferences';
import ssZnc from './ssZnc';


const processingAccountSet = new Set();
const processingAccountAppSet = new Set();


/**
 * @param {number} accountId
 * @returns {Promise<App[]>}
 */
function $_fetchAccountAppsMain(accountId) {
  return new Promise((resolve, reject) => {
    const znc = ssZnc.getZncByAccountId(accountId);
    znc.apiRequest('POST', '/v1/Game/ListWebServices', '')
      .then(apps => {
        storeAccounts.setAccountApps(accountId, apps);
        resolve(apps);
      })
      .catch(reject);
  });
}

/**
 * fetches application list of specified account
 * @param {number} accountId
 */
function fetchAccountApps(accountId, force = false, sendErrorTo = null) {
  const account = storeAccounts.getAccountById(accountId);
  if (!account) {
    return;
  }
  if (!force && account.$$appsFetched) {
    return;
  }
  //
  if (processingAccountSet.has(accountId)) {
    return;
  }
  processingAccountSet.add(accountId);
  $_fetchAccountAppsMain(accountId)
    .catch(error => {
      if (sendErrorTo !== false) {
        LdError.sendError({
          type: 'apiRequestError',
          data: {
            url: error.url,
            text: error.message,
          },
        }, sendErrorTo);
      }
    })
    .finally(() => {
      processingAccountSet.delete(accountId);
    });
}


// prefetch for all accounts on startup
// NOTE: use `sync` event of ssZnc (not 'mutate' event of storeAccounts)
//       this is because znc is not always prepared at the first account mutation (due to the load of preferences)
ssZnc.once('sync', () => {
  // place this if statement inside the function because preferences are not loaded yet in the outer scope
  // storePreferences.firstLoadCompleted === true here
  const {loginOnStartup, fetchAppListOnStartup} = storePreferences.preferences;
  if (loginOnStartup >= 0) {
    setTimeout(() => {
      for (const [accountId, znc] of ssZnc.accountZncMap.entries()) {
        znc.login(false)
          .then(() => {
            if (fetchAppListOnStartup >= 0) {
              setTimeout(() => {
                fetchAccountApps(accountId, false);
              }, fetchAppListOnStartup);
            }
          })
          .catch(error => {
            LdError.sendError({
              type: 'apiRequestError',
              data: {
                url: error.url,
                text: error.message,
              },
            });
          });
      }
    }, loginOnStartup);
  }
});

ipc.on('getAccountApps', (accountId, event) => {
  fetchAccountApps(accountId, true, event.sender.id);
});

ipc.on('getAppLaunchData', ({accountId, appId}, event) => {
  const account = storeAccounts.getAccountById(accountId);
  if (!account) {
    throw new LdError('accountInexistentError', {
      accountId,
    });
  }

  const key = `${accountId}/${appId}`;
  if (processingAccountAppSet.has(key)) {
    return;
  }
  processingAccountAppSet.add(key);

  (async () => {
    if (!storeAccounts.accountAppExists(accountId, appId)) {
      await $_fetchAccountAppsMain(accountId);
    }

    const app = storeAccounts.getAccountAppById(accountId, appId);
    if (!app) {
      throw new LdError('appInexistent', {
        account: storeAccounts.getAccountById(accountId),
        appId,
      });
    }

    if (!ssZnc.firstSyncCompleted) {
      await ssZnc.waitForFirstSync();
    }

    const znc = ssZnc.getZncByAccountId(accountId);

    // TODO: caching
    const webServiceToken = await znc.apiRequest('POST', '/v1/Game/GetWebServiceToken', {
      id: appId,
    });

    const url = app.uri.replace(/\/+$/, '') + '/?lang=' + encodeURIComponent(znc.naAccountInfo.language);
    const headers = znc.generateWebServiceRequestHeaders(webServiceToken.accessToken);
    const strHeaders = Object.entries(headers).map(kvPair => `${kvPair[0]}: ${kvPair[1]}`).join('\n');

    // broadcast in case multiple page requests data
    ipc.broadcast('appLaunchData', {
      accountId,
      appId,
      url,
      headers: strHeaders,
      domains: app.whiteList,
      userAgent: storePreferences.preferences.napi.webview.userAgent,
    });
  })()
    .catch(error => {
      if (!(error instanceof LdError)) {
        error = {
          type: 'apiRequestError',
          data: {
            url: error.url,
            text: error.message,
          },
        };
      }
      LdError.sendError(error, event.sender.id);
    })
    .finally(() => {
      processingAccountAppSet.delete(key);
    });
});
