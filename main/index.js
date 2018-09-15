import {app, dialog} from 'electron';

import {appName, appProtocol, appHostname, appStartupPath} from '../common/config';
import './stores/storeActiveRoutes';
import './stores/storeAccounts';
import './stores/storePreferences';
import './initPlatformCheck';
import './initSsZnc';
import './initAddAccount';
import './initUserDataDirectory';
import './initDevToolsExtensions';
import './initSecurity';
import './initNewWindowHandler';
import './initMenu';
import './initWindowResizeHandler';
import './initMiscNonFetchUserAgent';
import './initAppCommandHandler';
import './initIpcSpecialCommands';
import './initQuitCommand';
import './initActiveRoutes';
import './initAccountApiInterop';
import './initAppProtocol';
import './initFetchProtocol';
import './initSingleInstance';
import './initOpenLCHtmlFile';
import singleInstance from './lib/singleInstance';
import asyncInitPromise from './asyncInitialization';
import createWindow from './createWindow';


const isProduction = process.env.NODE_ENV === 'production';


if (!isProduction) {
  // eslint-disable-next-line no-console
  console.log(process.versions);
}


(() => {
  /**
   * main initialization
   * will be called after preparation completed
   * NOTE: app is ready (app.isReady() === true) in the function because of protocol initialization
   */
  function $$init() {
    let windowAllClosed = false;

    /**
     * creates a window
     */
    function createStartupWindow() {
      // startup window will shown immediately after created regardless of the preference
      createWindow(`${appProtocol}://${appHostname}${appStartupPath}`, null, true);
    }

    // quit application when all windows are closed
    app.on('window-all-closed', () => {
      // on macOS it is common for applications to stay open until the user explicitly quits
      windowAllClosed = true;
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      // on macOS it is common to re-create a window even after all windows have been closed
      if (windowAllClosed) {
        createStartupWindow();
        windowAllClosed = false;
      }
    });

    createStartupWindow();
  }

  if (!singleInstance.isFirstInstance) {
    app.quit();
    return;
  }

  Promise.all([
    asyncInitPromise,
  ]).then($$init)
    .catch(entries => {
      const errorEntries = entries.filter(([, value]) => value.error != null);
      const message = errorEntries
        .map(([key, value]) => `${key}: ${value.error.message || value.error}`)
        .join('\n\n');
      dialog.showMessageBox({
        type: 'error',
        title: appName,
        message: 'An error has occured during initialization process',
        detail: message,
      });
      app.quit();
    });
})();
