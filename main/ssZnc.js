// simple store for znc instances

import {EventEmitter} from 'events';

import {currentAccountsFileVersion} from '../common/config';
import {clientId, scope} from '../common/napiConfig';
import Znc from './lib/napi/Znc';
import storeAccounts from './stores/storeAccounts';
import storePreferences from './stores/storePreferences';


/**
 * creates Znc instance from exported znc object
 * preferences (in storePreferences) must be loaded in advance
 * @param {Object} zncObject
 * @returns {Znc}
 */
export function createZncInstanceFromZncObject(zncObject) {
  if (!storePreferences.firstLoadCompleted) {
    throw new Error('preferecnes not loaded yet');
  }

  const napiConfig = storePreferences.preferences.napi;

  return new Znc({
    ...zncObject,
    userAgent: napiConfig.znc.userAgent,
    xPlatform: napiConfig.znc.xPlatform,
    isAnalyticsOptedIn: napiConfig.znc.isAnalyticsOptedIn,
    isAppAnalyticsOptedIn: napiConfig.znc.isAppAnalyticsOptedIn,
    na: {
      ...zncObject.na,
      userAgent: napiConfig.na.userAgent,
      clientId,
      scope,
    },
  });
}


/**
 * creates an account object from a Znc instance
 * @param {Znc} znc
 * @param {Object} userInfo
 * @param {boolean} includeId
 * @returns {Account}
 */
export function createAccountFromZnc(znc, userInfo = znc.$_loginInfo.user, includeId = true) {
  const account = {
    version: currentAccountsFileVersion,
  };
  if (includeId) {
    account.id = userInfo.id;
  }
  const extraInfo = {...userInfo};
  delete extraInfo.id;
  for (const key of [
    'name',
    'imageUri',
  ]) {
    account[key] = userInfo[key];
    delete extraInfo[key];
  }
  account.extraInfo = extraInfo;
  account.znc = znc.exportZncObject();
  return account;
}


/**
 * returns a - b
 * @param {Set<T>} a
 * @param {Set<T>} b
 * @returns {Set<T>}
 * @template T
 */
function diffSets(a, b) {
  return new Set(Array.from(a).filter(v => !b.has(v)));
}

class SsZnc extends EventEmitter {
  /**
   * creates an instance of Znc from account
   * preferences (in storePreferences) must be loaded in advance
   * @param {Account} account
   * @returns {Znc}
   */
  static createZncInstanceFromAccount(account) {
    const accountId = account.id;

    const instZnc = createZncInstanceFromZncObject(account.znc);

    instZnc.on('login', newInfo => {
      const account = storeAccounts.getAccountById(accountId);
      if (!account) {
        return;
      }
      Object.assign(account, createAccountFromZnc(instZnc, newInfo, false));
      storeAccounts.$$onMutate(null, accountId);
    });

    return instZnc;
  }

  constructor() {
    super();

    /** @type {Map<number, Znc>} */
    this.accountZncMap = new Map();
    this.firstSyncCompleted = false;

    {
      // set true if preferences are not loaded yet on account mutations
      let syncOnFirstPreferencesLoad = false;

      storePreferences.once('firstLoad', () => {
        if (!syncOnFirstPreferencesLoad) {
          return;
        }
        if (!storeAccounts.firstLoadCompleted) {
          // must not happen
          return;
        }
        this.sync(storeAccounts.accounts);
      });

      storeAccounts.on('mutate', accounts => {
        if (!storePreferences.firstLoadCompleted) {
          // sync on preferences load
          syncOnFirstPreferencesLoad = true;
          return;
        }
        this.sync(accounts);
      });
    }
  }

  /**
   * @param {Account[]} accounts
   */
  sync(accounts) {
    /** @type {Set<number>} */
    const remoteAccountIdSet = new Set(accounts.map(account => account.id));
    /** @type {Set<number>} */
    const localAccountIdSet = new Set(this.accountZncMap.keys());
    const removedAccountIdSet = diffSets(localAccountIdSet, remoteAccountIdSet);
    const addedAccountIdSet = diffSets(remoteAccountIdSet, localAccountIdSet);
    // delete removed accounts' znc instance
    for (const accountId of removedAccountIdSet) {
      //console.log('ssznc delete', accountId);
      this.accountZncMap.delete(accountId);
    }
    // add new accounts' znc instance
    for (const accountId of addedAccountIdSet) {
      const account = accounts.find(account => account.id === accountId);
      //console.log('ssznc add', accountId, account);
      this.accountZncMap.set(accountId, SsZnc.createZncInstanceFromAccount(account));
    }
    // emit
    this.firstSyncCompleted = true;
    this.emit('sync', accounts);
  }

  /**
   * returns Znc instance for specified account
   * @param {number} accountId
   * @returns {Znc}
   */
  getZncByAccountId(accountId) {
    return this.accountZncMap.get(accountId);
  }

  /**
   * waits for first sync
   * @returns {Promise<void>}
   */
  waitForFirstSync() {
    if (this.firstSyncCompleted) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      this.once('sync', () => {
        resolve();
      });
    });
  }
}


export default new SsZnc();
