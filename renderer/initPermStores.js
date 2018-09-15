import {setPreferences} from './lib/permStorePreferences';
import store from './vueStore';


store.watch(state => state.preferences.preferences, preferences => {
  setPreferences(preferences);
}, {
  deep: true,
});
