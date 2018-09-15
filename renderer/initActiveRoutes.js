import {Route} from 'vue-router';   // eslint-disable-line no-unused-vars

import xfi from './lib/xfi';
import * as ipc from './lib/ipc';
import {$_get as getNavigationCallbacks} from './lib/ssNavigationCallbacks';
import store from './vueStore';
import router from './vueRouter';


let gIsFirstNavigation = true;
let gQueue = [];


/**
 * processes router.beforeEach call
 * extracted in order to queue requests
 * @param {Route} to
 * @param {Route} from
 * @param {(to?: RawLocation | false | void) => void} next
 * @param {boolean} isFirst - is this the first routing
 */
function processRequest(to, from, next, isFirst) {
  const canNavigate = !store.getters.isRouteActive(to.path);
  // getNavigationCallbacks() must be called before next()
  for (const callback of getNavigationCallbacks()) {
    // eslint-disable-next-line callback-return
    callback(canNavigate, to, from);
  }
  if (!canNavigate) {
    // focus the window which shows the target page if this window is focused on or this is the first navigation
    if (isFirst || xfi.window.isFocused()) {
      ipc.send('focusRoute', to.path);
    }
    // close if the first navigation failed
    if (isFirst) {
      window.close();
    }
    next(false);
    return;
  }
  if (isFirst) {
    ipc.send('singleWindowConfirmed');
  }
  next();
}

router.beforeEach((to, from, next) => {
  // NOTE: router.beforeEach is always called at the first routing (e.g. opening /preferences) w/ from = /
  const isFirst = gIsFirstNavigation;
  if (gIsFirstNavigation) {
    gIsFirstNavigation = false;
  }
  if (!store.getters.isActiveRoutesFetched) {
    // store the request
    // process after fetching active routes
    gQueue.push([to, from, next, isFirst]);
    return;
  }
  processRequest(to, from, next, isFirst);
});

router.afterEach((to, from_) => {
  ipc.send('routeUpdated', to.path);
});

store.watch((state_, getters) => getters.isActiveRoutesFetched, fetched => {
  if (fetched) {
    // process stored requests
    for (const requestArgs of gQueue) {
      processRequest(...requestArgs);
    }
    gQueue = [];
  }
});
