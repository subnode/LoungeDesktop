import {BrowserWindow, app, webContents} from 'electron';

import {urlToPath} from './lib/urlPathConverter';
import * as ipc from './lib/ipc';
import {addOpenControlHandler} from './lib/ssNewWindowControllers';
import storeActiveRoutes from './stores/storeActiveRoutes';


/**
 * focuses the window which shows specified page
 * @param {string} routePath
 */
function focusRoute(routePath) {
  const id = storeActiveRoutes.getIdByRoute(routePath);
  if (id == null) {
    return;
  }
  const wc = webContents.fromId(id);
  if (!wc) {
    return;
  }
  const window = BrowserWindow.fromWebContents(wc);
  if (!window) {
    return;
  }
  if (window.isMinimized()) {
    window.restore();
  }
  window.focus();
}


ipc.on('focusRoute', routePath => {
  focusRoute(routePath);
});

app.on('web-contents-created', (appEvent, contents) => {
  // NOTE: do NOT store contents.id here because it's 0 yet
  let id;
  contents.once('did-start-loading', () => {
    id = contents.id;
  });
  contents.once('destroyed', () => {
    storeActiveRoutes.deleteId(id);
  });
});

addOpenControlHandler((contents_, event_, url) => {
  const path = urlToPath(url);
  if (storeActiveRoutes.isRouteActive(path)) {
    // focus existing window instead of opening new one
    focusRoute(path);
    return false;
  }
  // ok
  return true;
});
