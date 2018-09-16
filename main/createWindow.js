import {BrowserWindow, webContents} from 'electron';

import {appName, themes, themeBackgroundColor} from '../common/config';
import {urlToPath} from './lib/urlPathConverter';
import toPreloadPath from '../common/lib/preloadPath';
import * as ipc from './lib/ipc';
import storeActiveRoutes from './stores/storeActiveRoutes';
import storePreferences from './stores/storePreferences';


const isProduction = process.env.NODE_ENV === 'production';

const windowOffsetX = 60;
const windowOffsetY = windowOffsetX;

const preload = toPreloadPath(FILENAMES.preloadRendererJs, false);

// for preventing GC
const aliveWindowSet = new Set();

/**
 * @param {string} url
 * @param {?BrowserWindow} opener
 * @param {?boolean} show
 * @returns {BrowserWindow}
 */
export default function createWindow(url, opener = null, show = false) {
  if (!storePreferences.firstLoadCompleted) {
    throw new Error('preferences not loaded yet');
  }

  const route = urlToPath(url);
  if (storeActiveRoutes.isRouteActive(route)) {
    const id = storeActiveRoutes.getIdByRoute(route);
    const contents = webContents.fromId(id);
    if (!contents) {
      return null;
    }
    const window = BrowserWindow.fromWebContents(contents);
    if (!window) {
      return null;
    }
    window.focus();
    return null;
  }

  const currentTheme = themes.find(theme => theme.id === storePreferences.preferences.theme);
  const backgroundColor = currentTheme ? themeBackgroundColor[currentTheme.theme] : undefined;

  const {windowSize} = storePreferences.preferences;

  const config = {
    width: windowSize && windowSize.width,
    height: windowSize && windowSize.height,
    useContentSize: true,
    title: appName,    // TODO?
    show,
    backgroundColor,
    webPreferences: {
      devTools: !isProduction,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      preload,
      webviewTag: true,
    },
  };

  if (opener) {
    const [x, y] = opener.getPosition();
    config.x = x + windowOffsetX;
    config.y = y + windowOffsetY;
  }

  const window = new BrowserWindow(config);

  aliveWindowSet.add(window);

  window.on('closed', () => {
    aliveWindowSet.delete(window);
  });

  window.once('ready-to-show', () => {
    // always
    if (!window.isVisible()) {
      window.show();
    }
  });

  if (!isProduction) {
    window.webContents.openDevTools();

    window.webContents.on('devtools-opened', () => {
      window.focus();
      setImmediate(() => {
        window.focus();
      });
    });
  }

  window.loadURL(url);

  if (storePreferences.preferences.showWindowOn === 'created') {
    if (!window.isVisible()) {
      window.show();
    }
  }

  return window;
}


ipc.on('singleWindowConfirmed', (data_, event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) {
    return;
  }
  if (storePreferences.firstLoadCompleted && storePreferences.preferences.showWindowOn === 'rendered') {
    if (!window.isVisible()) {
      window.show();
    }
  }
});
