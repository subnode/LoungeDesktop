import Vue from 'vue';

import {accountPlaceholder} from '../../common/config';
import * as ipc from '../lib/ipc';


export default {
  state: {
    $_fetched: false,
    accounts: [],
  },
  mutations: {
    $_loadAccounts(state, accounts) {
      state.$_fetched = true;
      state.accounts = accounts;
      if (MAX_ACCOUNTS) {
        state.accounts = state.accounts.slice(0, MAX_ACCOUNTS);
      }
    },
    $_loadAccount(state, account) {
      const accountIndex = state.accounts.findIndex(value => value.id === account.id);
      if (accountIndex === -1) {
        return;
      }
      Vue.set(state.accounts, accountIndex, account);
    },
    removeAccount(state, accountId) {
      state.accounts = state.accounts
        .filter(account => account.id !== accountId);
    },
    setAccounts(state, accounts) {
      // do nothing if nothing changed
      // for preventing infinite loops
      if (accounts.length === state.accounts.length && accounts.every((account, index) => account.id === state.accounts[index].id)) {
        return;
      }
      const accountIds = accounts.map(account => account.id);

      state.accounts = accountIds
        .map(accountId => state.accounts.find(account => account.id === accountId))
        .filter(account => account);
    },
  },
  getters: {
    isAccountsFetched(state) {
      return state.$_fetched;
    },
    isAccontAppsFetched(state) {
      return id => {
        const account = state.accounts.find(value => value.id === id);
        if (!account) {
          return null;
        }
        return account.$$appsFetched;
      };
    },
    accountExists(state) {
      return id => {
        const accountIndex = state.accounts.findIndex(value => value.id === id);
        return accountIndex !== -1;
      };
    },
    getAccountById(state) {
      return (id, returnsUndefined = false) => {
        const account = state.accounts.find(value => value.id === id);
        return account || (returnsUndefined ? undefined : {
          ...accountPlaceholder,
          id,
        });
      };
    },
  },
  actions: {
    $$init(context, store) {
      ipc.on('accounts', accounts => {
        if (MAX_ACCOUNTS) {
          accounts = accounts.slice(0, MAX_ACCOUNTS);
        }
        context.commit('$_loadAccounts', accounts);
      });
      ipc.on('account', account => {
        context.commit('$_loadAccount', account);
      });
      store.subscribe((mutation, state) => {
        // NOTE: this function is called from all the mutations (including other modules', such as $_setActiveRoutes or setError)
        if (!['removeAccount', 'setAccounts'].includes(mutation.type)) {
          return;
        }
        ipc.send('setAccounts', state.accounts.accounts.map(account => account.id));
      });
      context.dispatch('fetchAccounts');
    },
    fetchAccounts(context_) {
      ipc.send('getAccounts');
    },
    fetchAccountApps(context_, accountId) {
      ipc.send('getAccountApps', accountId);
    },
  },
};
