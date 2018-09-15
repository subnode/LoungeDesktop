import Vue from 'vue';
import Vuex from 'vuex';

import storeActiveRoutes from './stores/storeActiveRoutes';
import storeError from './stores/storeError';
import storeAccounts from './stores/storeAccounts';
import storePreferences from './stores/storePreferences';


Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    activeRoutes: storeActiveRoutes,
    error: storeError,
    accounts: storeAccounts,
    preferences: storePreferences,
  },
  strict: process.env.NODE_ENV !== 'production',
  plugins: [
    store => {
      store.dispatch('$$init', store);
    },
  ],
});
