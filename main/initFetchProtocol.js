import {app, protocol} from 'electron';
import {PassThrough} from 'stream';
import fetch from 'node-fetch';

import {fetchProtocolPrefix, fetchableProtocols} from '../common/config';
import ssInitialization from './lib/ssInitialization';
import registerStandardScheme from './lib/standardSchemes';
import storePreferences from './stores/storePreferences';


/**
 * creates a readable stream, which returns nothing
 */
function createNullStream() {
  const stream = new PassThrough();
  stream.push(null);
  return stream;
}

/**
 * registers fetch protocol for specified protocol
 * @param {string} baseProtocol
 * @returns {Promise<void>}
 */
function registerFetchProtocol(baseProtocol) {
  return new Promise((resolve, reject) => {
    const fetchProtocol = fetchProtocolPrefix + baseProtocol;

    registerStandardScheme(fetchProtocol);

    app.once('ready', () => {
      protocol.registerStreamProtocol(fetchProtocol, (request, callback) => {
        if (!storePreferences.firstLoadCompleted) {
          callback({
            statusCode: 500,
            headers: {
              'Content-Type': 'text/plain',
            },
            data: createNullStream(),
          });
          return;
        }

        if (request.method !== 'GET' && request.method !== 'HEAD') {
          callback({
            statusCode: 501,
            headers: {
              'Content-Type': 'text/plain',
            },
            data: createNullStream(),
          });
          return;
        }

        const {userAgent} = storePreferences.preferences.napi.miscFetch;

        const url = request.url.replace(/^[^:]+/, baseProtocol);

        const headers = {...request.headers};
        // replace user-agent
        for (const key of Object.keys(headers)) {
          if (key.toLowerCase() === 'user-agent') {
            delete headers[key];
          }
        }
        // always set User-Agent to prevent setting node-fetch's default User-Agent
        headers['User-Agent'] = userAgent;

        const [, origin] = Object.entries(headers).find(([key]) => key.toLowerCase() === 'origin') || [];

        fetch(url, {
          method: request.method,
          headers,
        }).then(res => {
          if (origin) {
            res.headers.set('Access-Control-Allow-Origin', origin);
            if (res.headers.has('Vary')) {
              const strOrgVary = res.headers.get('Vary');
              const orgVaries = strOrgVary.toLowerCase().split(/,\s*/);
              if (!orgVaries.includes('origin')) {
                res.headers.set('Vary', strOrgVary + ', Origin');
              }
            } else {
              res.headers.set('Vary', 'Origin');
            }
          } else {
            res.headers.set('Access-Control-Allow-Origin', '*');
          }
          const responseHeaderObject = Array.from(res.headers.entries())
            .reduce((acc, [key, value]) => (acc[key] = value, acc), {});
          callback({
            statusCode: res.status,
            headers: responseHeaderObject,
            data: res.body,
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

/**
 * initializes fetch protocol
 * @returns {Promise<void>}
 */
function asyncInitFetchProtocol() {
  const promises = fetchableProtocols.map(registerFetchProtocol);
  return Promise.all(promises);
}


ssInitialization.registerInitialization('fetchProtocol', asyncInitFetchProtocol());

const initCallbackForPref = ssInitialization.registerInitialization('fetchProtocolPref');
storePreferences.once('firstLoad', initCallbackForPref);
