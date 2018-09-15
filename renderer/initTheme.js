import Vue from 'vue';

import store from './vueStore';
import './vueMaterial';


/**
 * updates theme to specified one
 * @param {string} theme
 */
function updateTheme(theme) {
  Vue.material.theming.theme = theme;
}


// set initial theme (readed from LocalStorage) to improve UX
updateTheme(store.state.preferences.preferences.theme);

store.watch(state => state.preferences.preferences.theme, theme => {
  updateTheme(theme);
});
