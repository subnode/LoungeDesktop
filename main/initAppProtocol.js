import {app, protocol} from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import {URL} from 'url';

import {appProtocol} from '../common/config';
import basePath from './lib/basePath';
import ssInitialization from './lib/ssInitialization';
import registerStandardScheme from './lib/standardSchemes';


const fallbackPath = path.join(basePath, FILENAMES.indexHtml);


/**
 * initializes app protocol
 * @returns {Promise<void>}
 */
function asyncInitAppProtocol() {
  return new Promise((resolve, reject) => {
    registerStandardScheme(appProtocol);

    app.once('ready', () => {
      protocol.registerFileProtocol(appProtocol, (request, callback) => {
        const url = new URL(request.url);
        //console.log('[PROTO]', request.url, url.pathname);
        const filePath = path.join(basePath, url.pathname || '');

        fs.stat(filePath, (err, stats) => {
          const isFile = !err && stats.isFile();
          //console.log(filePath, isFile);
          callback({
            path: isFile ? filePath : fallbackPath,
          });
        });
      }, error => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });
}


ssInitialization.registerInitialization('appProtocol', asyncInitAppProtocol());
