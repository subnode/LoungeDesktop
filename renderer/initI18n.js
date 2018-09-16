import store from './vueStore';
import i18n from './vueI18n';


/**
 * updates locale to specified one
 * @param {string} locale
 */
function updateLocale(locale) {
  i18n.locale = locale;
}


// set initial locale (read from LocalStorage) to improve UX
updateLocale(store.state.preferences.preferences.language);

store.watch(state => state.preferences.preferences.language, locale => {
  updateLocale(locale);
});
