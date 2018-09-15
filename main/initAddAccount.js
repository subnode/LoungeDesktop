import {app, shell} from 'electron';

import {appProtocol, appHostname, appStartupPath} from '../common/config';
import {clientId, scope} from '../common/napiConfig';
import LdError from './lib/Error';
import * as ipc from './lib/ipc';
import singleInstance from './lib/singleInstance';
import {registerProtocolHandler, unregisterProtocolHandler, isProtocolHandlerRegistered} from './lib/protocolHandler';
import Na from './lib/napi/Na';
import storeAccounts from './stores/storeAccounts';
import storePreferences from './stores/storePreferences';
import createWindow from './createWindow';
import {createZncInstanceFromZncObject, createAccountFromZnc} from './ssZnc';
import storeActiveRoutes from './stores/storeActiveRoutes';


const redirectUri = Na.generateRedirectUri(clientId);

/** @type {Set<Na>} */
const pendingNaSet = new Set();


/**
 * @returns {Na}
 */
function createNaForAuthorization() {
  if (MAX_ACCOUNTS && storeAccounts.accounts.length >= MAX_ACCOUNTS) {
    throw new Error('account limit exceeded');
  }

  if (!storePreferences.firstLoadCompleted) {
    throw new Error('preferences not loaded yet');
  }

  const na = new Na({
    clientId,
    scope,
    userAgent: storePreferences.preferences.napi.na.userAgent,
  });

  return na;
}

/**
 * @param {Na} na
 * @param {string} uri
 */
async function authorizationCallback(na, uri) {
  if (MAX_ACCOUNTS && storeAccounts.accounts.length >= MAX_ACCOUNTS) {
    throw new Error('account limit exceeded');
  }

  await na.authorizationCallback(uri);

  const znc = createZncInstanceFromZncObject({na});
  await znc.login();

  const account = createAccountFromZnc(znc);
  storeAccounts.addAccount(account);

  return account;
}

/**
 * @param {?number} tp
 */
function sendStatus(to = null) {
  const data = {
    pendingCount: pendingNaSet.size,
    protocolRegitsered: isProtocolHandlerRegistered(),
  };
  if (to != null) {
    ipc.send('addAccountStatus', data, to);
  } else {
    ipc.broadcast('addAccountStatus', data);
  }
}

/**
 * @param {number} to
 */
function openAuthorizationPage(to) {
  try {
    const na = createNaForAuthorization();

    if (!isProtocolHandlerRegistered()) {
      registerProtocolHandler();
    }

    const url = na.generateAuthorizationUrl().toString();
    shell.openExternal(url);

    pendingNaSet.add(na);

    sendStatus();

    if (!isProtocolHandlerRegistered()) {
      ipc.send('showAddAccountByUrl', null, to);
    }
  } catch(error) {
    LdError.sendError({
      type: 'newAccountError',
      data: {
        text: error.message,
      },
    }, to);
  }
}

/**
 * @param {string} uri
 * @param {boolean} unregister
 * @param {?number} to
 */
function handleRedirectUri(uri, unregister, to) {
  (async () => {
    //ipc.broadcast('addingAccount');

    if (typeof uri !== 'string' || !uri.startsWith(redirectUri)) {
      throw new Error('invalid uri specified');
    }

    const parsedUri = Na.parseCallbackUrl(clientId, uri);

    const na = Array.from(pendingNaSet).find(na => na.state === parsedUri.state);
    if (!na) {
      throw new Error('no such state');
    }

    pendingNaSet.delete(na);

    sendStatus();

    if (unregister && isProtocolHandlerRegistered()) {
      unregisterProtocolHandler();
    }

    const account = await authorizationCallback(na, uri);

    return account;
  })()
    .then(account => {
      ipc.broadcast('accountAdded', account);
    })
    .catch(error => {
      if (to == null) {
        to = [
          storeActiveRoutes.getIdByRoute('/accounts'),
          storeActiveRoutes.getIdByRoute('/'),
        ].find(x => x != null);
      }

      LdError.sendError({
        type: 'newAccountError',
        data: {
          text: error.message,
        },
      }, to);
    });
}


singleInstance.on('newInstance', argv => {
  if (!singleInstance.isFirstInstance) {
    return;
  }

  try {
    createWindow(`${appProtocol}://${appHostname}${appStartupPath}`);
  } catch(error_) { /* do nothing */ }

  const uri = argv[1];
  if (uri && uri.startsWith(redirectUri)) {
    handleRedirectUri(uri, true, null);
  }
});

ipc.on('openAuthPage', (data_, event) => {
  openAuthorizationPage(event.sender.id);
});

ipc.on('addAccountByUrl', (uri, event) => {
  handleRedirectUri(uri, false, event.sender.id);
});

ipc.on('getAddAccountStatus', (data_, event) => {
  sendStatus(event.sender.id);
});

app.once('quit', () => {
  unregisterProtocolHandler();
});


//registerProtocolHandler();
