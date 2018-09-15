import {ipcRenderer, remote, shell, webFrame} from 'electron';
import * as fs from 'fs';
import {promisify} from 'util';

import toPreloadPath from '../../common/lib/preloadPath';
import {appProtocol, fetchProtocolPrefix, fetchableProtocols} from '../../common/config';


// make app protocol fetchable
webFrame.registerURLSchemeAsPrivileged(appProtocol, {
  secure: true,
  bypassCSP: false,
  allowServiceWorkers: true,
  supportFetchAPI: true,
  corsEnabled: true,
});

// make fetch protocols fetchable
for (const baseProtocol of fetchableProtocols) {
  const protocol = fetchProtocolPrefix + baseProtocol;
  webFrame.registerURLSchemeAsPrivileged(protocol, {
    secure: true,
    bypassCSP: false,
    allowServiceWorkers: false,
    supportFetchAPI: true,
    corsEnabled: true,
  });
}


// export

const pWriteFile = promisify(fs.writeFile);
const currentWindow = remote.getCurrentWindow();

const xfi = {
  ipc: {
    on(...args) {
      return ipcRenderer.on(...args);
    },
    send(...args) {
      return ipcRenderer.send(...args);
    },
  },
  shell: {
    openExternal(url) {
      if (!/^https?:\/\//.test(url)) {
        return null;
      }
      return shell.openExternal(url);
    },
  },
  window: {
    isFocused() {
      return currentWindow.isFocused();
    },
  },
  toPreloadPath,
  async saveToDisk(url, dialogOptions) {
    /**
     * async showSaveDialog
     * @param {Object} options
     * @returns {Promise<?string>}
     */
    function showSaveDialog(options) {
      return new Promise(resolve => {
        remote.dialog.showSaveDialog(currentWindow, options, filename => {
          resolve(filename);
        });
      });
    }

    /**
     * @param {string} url
     * @returns {Promise<Buffer>}
     */
    async function blobUrlToBuffer(url) {
      if (!url.startsWith('blob:')) {
        throw new Error('not a blob');
      }
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    const [filePath, data] = await Promise.all([
      showSaveDialog(dialogOptions),
      blobUrlToBuffer(url),
    ]);

    if (!filePath || !data) {
      return;
    }

    try {
      await pWriteFile(filePath, data);
    } catch(error) {
      error.filePath = filePath;
      throw error;
    }
  },
};


{
  let gotFlag = false;
  window.$$getXFI = () => {
    if (gotFlag) {
      return null;
    }
    gotFlag = true;
    delete window.$$getXFI;
    return xfi;
  };
}



// for Devtron
if (process.env.NODE_ENV !== 'production') {
  window.__devtron = {
    // obtain original require
    // eslint-disable-next-line no-eval
    require: eval('.require'.slice(1)),
    process,
  };
}
