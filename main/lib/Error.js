import {BrowserWindow} from 'electron';

import * as ipc from './ipc';


export default class LdError extends Error {
  static sendError(error, to = null) {
    if (to == null) {
      const window = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
      if (!window || !window.webContents) {
        return;
      }
      to = window.webContents.id;
    }
    ipc.send('error', error, to);
  }

  constructor(type, data) {
    super();
    this.type = type;
    this.data = data;
  }

  toJSON() {
    return {
      type: this.type,
      data: this.data,
    };
  }
}
