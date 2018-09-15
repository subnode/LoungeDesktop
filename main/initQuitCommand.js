import {BrowserWindow} from 'electron';

import * as ipc from './lib/ipc';


ipc.on('quit', (data_, event_) => {
  for (const window of BrowserWindow.getAllWindows()) {
    window.close();
  }
});
