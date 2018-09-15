import {app} from 'electron';

import * as ipc from './lib/ipc';


/** @type {Map<number, Set<number>>} */
const childWebviewIdSetMap = new Map();

app.on('web-contents-created', (appEvent_, contents) => {
  let id;
  let hostId;

  contents.once('did-start-loading', () => {
    id = contents.id;
    hostId = contents.hostWebContents ? contents.hostWebContents.id : null;

    childWebviewIdSetMap.set(id, new Set());
  });

  contents.on('did-attach-webview', (event_, guestContents) => {
    childWebviewIdSetMap.get(id).add(guestContents.id);
  });

  contents.once('destroyed', () => {
    if (hostId != null && childWebviewIdSetMap.has(hostId)) {
      childWebviewIdSetMap.get(hostId).delete(id);
    }
    childWebviewIdSetMap.delete(id);
  });
});

app.on('browser-window-created', (appEvent_, window) => {
  window.on('app-command', (event_, command) => {
    if (!command) {
      return;
    }

    const contents = window.webContents;
    if (!contents) {
      return;
    }

    if (childWebviewIdSetMap.get(contents.id).size) {
      // process command in the renderer
      ipc.send('appCommand', command, contents.id);
      return;
    }

    switch (command) {
      case 'browser-backward':
        if (contents.canGoBack()) {
          contents.goBack();
        }
        break;

      case 'browser-forward':
        if (contents.canGoForward()) {
          contents.goForward();
        }
        break;
    }
  });
});
