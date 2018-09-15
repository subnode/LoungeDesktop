import {app} from 'electron';
import * as path from 'path';

import {addOpenControlHandler} from './lib/ssNewWindowControllers';
import {appProtocol} from '../common/config';


const basePath = path.normalize(app.getAppPath());

/**
 * @param {string} url
 * @returns {boolean}
 */
function isAppProtocol(url) {
  return url.startsWith(`${appProtocol}:`);
}

/**
 * @param {string} filePath
 * @returns {boolean}
 */
function isAppBasePath(filePath) {
  try {
    if (filePath.startsWith('file:')) {
      filePath = filePath.replace(/^file:\/+/, '');
      // add root ('/') path for non-windows platforms
      if (path.sep === '/') {
        filePath = '/' + filePath;
      }
    }
    const parsedPath = path.parse(path.normalize(filePath));
    return parsedPath.dir === basePath;
  } catch(error_) { /* parse failed; return false for safety */ }
  return false;
}


app.on('web-contents-created', (appEvent_, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (!isAppProtocol(url)) {
      event.preventDefault();
      return;
    }
  });

  contents.on('will-attach-webview', (event_, webPreferences) => {
    if (typeof webPreferences.preload !== 'string' || !isAppBasePath(webPreferences.preload)) {
      // eslint-disable-next-line no-console
      console.warn('delete preload', webPreferences.preload);
      delete webPreferences.preload;
    }
    if (typeof webPreferences.preloadURL !== 'string' || !isAppBasePath(webPreferences.preloadURL)) {
      // eslint-disable-next-line no-console
      console.warn('delete preload', webPreferences.preloadURL);
      delete webPreferences.preloadURL;
    }
    webPreferences.nodeIntegration = false;
    webPreferences.nodeIntegrationInWorker = false;
    webPreferences.webSecurity = true;
    webPreferences.allowRunningInsecureContent = false;
    webPreferences.plugins = false;
    webPreferences.experimentalFeatures = false;
    webPreferences.experimentalCanvasFeatures = false;
    webPreferences.allowpopups = false;
    webPreferences.nativeWindowOpen = false;
    delete webPreferences.affinity;
    delete webPreferences.blinkFeatures;
    delete webPreferences.enableBlinkFeatures;
    delete webPreferences.additionArguments;
  });
});

addOpenControlHandler((contents_, event_, url_, frameName_, disposition) => [
  'default',
  'foreground-tab',
  'background-tab',
  'new-window',
].includes(disposition));

addOpenControlHandler((contents_, event_, url) => isAppProtocol(url));

