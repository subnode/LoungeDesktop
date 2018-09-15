import {BrowserWindow, app} from 'electron';

import ssInitialization from './lib/ssInitialization';


const extensionPaths = [
  'node_modules/devtron',
  'node_modules/vue-devtools/vender',
];


if (process.env.NODE_ENV !== 'production' && /electron(?:\.exe)?$/i.test(process.argv[0])) {
  const initCallback = ssInitialization.registerInitialization('DevToolsExtensions');

  app.once('ready', () => {
    for (const extensionPath of extensionPaths) {
      BrowserWindow.addDevToolsExtension(extensionPath);
    }
    initCallback();
  });
}
