import Vue from 'vue';
import VueRouter from 'vue-router';

import {routerMode} from '../common/config';

import PageNotFound from './components/PageNotFound.vue';
import PageAbout from './components/PageAbout.vue';
import PagePreferences from './components/PagePreferences.vue';
import PageAccounts from './components/PageAccounts.vue';
import PageAccountApps from './components/PageAccountApps.vue';
import PageAccountApp from './components/PageAccountApp.vue';


Vue.use(VueRouter);

export default new VueRouter({
  mode: routerMode,
  routes: [
    {
      path: '/',
      redirect: '/accounts',
    },
    {
      path: '/about',
      component: PageAbout,
    },
    {
      path: '/preferences',
      component: PagePreferences,
    },
    {
      path: '/accounts',
      component: PageAccounts,
    },
    {
      path: '/accounts/:accountId',
      redirect: '/accounts/:accountId/apps',
    },
    {
      path: '/accounts/:accountId/apps',
      component: PageAccountApps,
    },
    {
      path: '/accounts/:accountId/apps/:appId',
      component: PageAccountApp,
    },
    {
      path: '*',
      component: PageNotFound,
    },
  ],
});
