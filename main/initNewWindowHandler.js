import {BrowserWindow} from 'electron';

import {setNewWindowCallback} from './lib/ssNewWindowControllers';
import createWindow from './createWindow';


/**
 * @param {string} url
 * @returns {boolean}
 */
function newWindowCallback(contents, event, url) {
  event.preventDefault();
  // eslint-disable-next-line no-unused-vars
  const window = createWindow(url, BrowserWindow.fromWebContents(contents));
  // leave event.newGuest undefined to keep created window alive on parent window close
  //event.newGuest = window;
}


setNewWindowCallback(newWindowCallback);
