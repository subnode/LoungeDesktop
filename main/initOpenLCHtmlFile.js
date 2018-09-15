import {app, shell} from 'electron';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
//import {URL} from 'url';
import {promisify} from 'util';

import * as ipc from './lib/ipc';
import ssInitialization from './lib/ssInitialization';


const packedFilePath = path.join(app.getAppPath(), FILENAMES.licensesChromiumHtml);
const bundledFilePath = path.join(app.getPath('exe'), '../LICENSES.chromium.html');

const pReadFile = promisify(fs.readFile);
const pWriteFile = promisify(fs.writeFile);

let processing = false;
let createdTempFilePath;
let fileContent;


/**
 * @returns {string}
 */
function generateTempFilePath() {
  const random = Math.floor(Math.random() * 10000);
  const dir = os.tmpdir();
  const fileName = `LDLC-${Date.now()}-${random}.html`;
  return path.join(dir, fileName);
}

/**
 * @returns {boolean}
 */
function canAccessDirectly() {
  return fs.existsSync(bundledFilePath);
}

/**
 * @returns {boolean}
 */
function isLastCreatedTempFileAvailable() {
  return createdTempFilePath && fs.existsSync(createdTempFilePath);
}

/**
 * opens html file
 */
function openHtmlFile(filePath) {
  /*
  const url = new URL(`file://${filePath}`);
  shell.openExternal(url.href);
  /*/
  shell.openItem(filePath);
  //*/
}

/**
 * @returns {Promise<void>}
 */
async function openLCHtmlFile() {
  if (canAccessDirectly()) {
    openHtmlFile(bundledFilePath);
    return;
  }
  if (!isLastCreatedTempFileAvailable()) {
    createdTempFilePath = generateTempFilePath();
    // NOTE: fs.copyFile cannot be used for files in asar archives
    if (!fileContent) {
      fileContent = await pReadFile(packedFilePath);
    }
    await pWriteFile(createdTempFilePath, fileContent);
  }
  openHtmlFile(createdTempFilePath);
}


ipc.on('openLCHtmlFile', () => {
  if (processing) {
    return;
  }
  processing = true;
  openLCHtmlFile()
    .catch(error => {
      // TODO:
      console.error(error);
    })
    .finally(() => {
      processing = false;
    });
});


if (!canAccessDirectly()) {
  ssInitialization.registerInitialization('OpenLCHtmlFile', (async () => {
    fileContent = await pReadFile(packedFilePath);
  })());
}
