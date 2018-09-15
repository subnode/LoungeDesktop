import {app as _app, remote} from 'electron';
import * as path from 'path';
import {URL} from 'url';


const app = process.type === 'browser' ? _app : remote.app;
//const URL = process.type === 'browser' ? _URL : window.URL;

const basePath = app.getAppPath();


/**
 * @param {string} fileName
 * @param {boolean} fileProtocol - whether use file: protocol or not. set true for webview's preload and false for renderer's preload
 * @returns {string}
 */
export default function toPreloadPath(fileName, fileProtocol = true) {
  const filePath = path.join(basePath, fileName);
  if (!fileProtocol) {
    return filePath;
  }
  const urlObject = new URL(`file://${filePath}`);
  return urlObject.href;
}
