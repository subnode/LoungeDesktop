import {EventEmitter} from 'events';
import * as fs from 'fs';
import * as path from 'path';

import {currentAccountsFileVersion} from '../../common/config';
import {userDataDirectory, accountsFilename} from '../lib/mainConfig';
import debounceWrapper from '../lib/debounce';
import * as ipc from '../lib/ipc';
import LdError from '../lib/Error';
import ssInitialization from '../lib/ssInitialization';
import {migrateAccount} from '../lib/versionAccount';


class StoreAccounts extends EventEmitter {
  static convertLoadedAccount(loadedAccount) {
    return {
      ...loadedAccount,
      $$appsFetched: false,
      $$apps: [],
    };
  }

  constructor() {
    super();

    this.$_writingFileCount = 0;
    this.$_accountsFilepath = path.join(userDataDirectory, accountsFilename);
    this.accounts = [];
    this.firstLoadCompleted = false;

    this.$_debouncedSaveToFile = debounceWrapper(this.$_saveToFile.bind(this), 1000);

    const initCallback = ssInitialization.registerInitialization('loadAccounts');

    fs.readFile(this.$_accountsFilepath, 'utf-8', (readError, data) => {
      try {
        if (readError) {
          if (readError.code !== 'ENOENT') {
            // error
            throw readError;
          }
          // first launch
          data = JSON.stringify([]);
        }
        // parse
        data = JSON.parse(data);
        // convert old version
        for (const [index, account] of data.entries()) {
          data[index] = migrateAccount(account);
          // set version
          data[index].version = currentAccountsFileVersion;
        }
        // load
        this.$_loadAccounts(data);
        initCallback(null);
      } catch(error) {
        initCallback(error);
      }
      this.firstLoadCompleted = true;
      this.emit('firstLoad');
    });

    ipc.on('setAccounts', (accountIds, event) => {
      this.setAccounts(accountIds, event.sender.id);
    });

    ipc.on('getAccounts', (data_, event) => {
      ipc.send('accounts', this.accounts, event.sender.id);
    });
  }

  $$onMutate(mutator = null, accountIds = null) {
    if (accountIds == null) {
      ipc.broadcast('accounts', this.accounts, mutator);
    } else {
      if (!Array.isArray(accountIds)) {
        accountIds = [accountIds];
      }
      for (const accountId of accountIds) {
        ipc.broadcast('account', this.getAccountById(accountId), mutator);
      }
    }

    // emit
    this.emit('mutate', this.accounts, mutator, accountIds);

    // save
    this.$_debouncedSaveToFile();
  }

  $_saveToFile() {
    this.$_writingFileCount++;

    if (this.$_writingFileCount > 1) {
      return;
    }

    const data = JSON.stringify(this.accounts.map(account => ({
      ...account,
      $$appsFetched: undefined,
      $$apps: undefined,
    })), null, 2);

    fs.writeFile(this.$_accountsFilepath, data, 'utf-8', error => {
      const count = this.$_writingFileCount;
      this.$_writingFileCount = 0;

      if (count > 1) {
        process.nextTick(() => {
          this.$_saveToFile();
        });
      }

      if (error) {
        LdError.sendError({
          type: 'ioWriteError',
          data: {
            file: accountsFilename,
            text: error.message,
          },
        });
        return;
      }
    });
  }

  $_loadAccounts(accounts) {
    this.accounts = accounts
      .map(account => StoreAccounts.convertLoadedAccount(account));
    if (MAX_ACCOUNTS) {
      this.accounts = this.accounts.slice(0, MAX_ACCOUNTS);
    }
    this.$$onMutate();
  }

  getAccountById(accountId) {
    return this.accounts.find(account => account.id === accountId);
  }

  accountExists(accountId) {
    return !!this.getAccountById(accountId);
  }

  getAccountAppById(accountId, appId) {
    const account = this.getAccountById(accountId);
    if (!account) {
      return null;
    }
    return account.$$apps.find(app => app.id === appId);
  }

  accountAppExists(accountId, appId) {
    return !!this.getAccountAppById(accountId, appId);
  }

  addAccount(account) {
    if (MAX_ACCOUNTS && this.accounts.length >= MAX_ACCOUNTS) {
      throw new Error('account limit exceeded');
    }
    if (this.accounts.find(currAccount => currAccount.id === account.id)) {
      throw new Error('account already exists');
    }
    this.accounts.push(StoreAccounts.convertLoadedAccount(account));
    this.$$onMutate();
  }

  setAccounts(accountIds, mutator) {
    this.accounts = accountIds
      .map(accountId => this.accounts.find(account => account.id === accountId))
      .filter(account => account);
    this.$$onMutate(mutator);
  }

  setAccountApps(accountId, apps) {
    if (!Array.isArray(apps)) {
      // invalid apps specified
      return;
    }
    const accountIndex = this.accounts.findIndex(account => account.id === accountId);
    if (accountIndex === -1) {
      // account does not exist
      return;
    }
    const account = this.accounts[accountIndex];
    account.$$appsFetched = true;
    account.$$apps = apps;
    this.$$onMutate(null, accountId);
  }
}


export default new StoreAccounts();
