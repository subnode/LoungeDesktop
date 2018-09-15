import {getPreferences} from '../lib/permStorePreferences';
import * as ipc from '../lib/ipc.js';


export default {
  state: {
    preferences: getPreferences(),
  },
  mutations: {
    $_loadPreferences(state, preferences) {
      state.preferences = preferences;
    },
    setPreferences(state, preferences) {
      state.preferences = preferences;
    },
  },
  actions: {
    $$init(context, store) {
      ipc.on('preferences', preferences => {
        context.commit('$_loadPreferences', preferences);
      });
      store.subscribe((mutation, state) => {
        // NOTE: this function is called on all the mutations (including other modules', such as $_setActiveRoutes or setError)
        if (!['setPreferences'].includes(mutation.type)) {
          return;
        }
        ipc.send('setPreferences', state.preferences.preferences);
      });
      context.dispatch('fetchPreferences');
    },
    fetchPreferences(context_) {
      ipc.send('getPreferences');
    },
  },
};
