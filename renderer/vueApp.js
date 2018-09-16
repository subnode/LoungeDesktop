import Vue from 'vue';

import mixinTitle from './lib/mixinTitle';
import store from './vueStore';
import router from './vueRouter';
import i18n from './vueI18n';
import './vueMaterial';
import './initAppCommandHandler';
import './initPermStores';
import './initActiveRoutes';
import './initTheme';
import './initI18n';
import App from './components/App.vue';


Vue.mixin(mixinTitle);

export default new Vue({
  components: {
    App,
  },
  el: '#app',
  render(createElement) {
    return createElement(App);
  },
  store,
  router,
  i18n,
});
