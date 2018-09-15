import {app, session} from 'electron';

import ssInitialization from './lib/ssInitialization';
import storePreferences from './stores/storePreferences';


const initCallbackForPref = ssInitialization.registerInitialization('miscNonFetchUserAgentPref');
const initCallbackForHook = ssInitialization.registerInitialization('miscNonFetchUserAgentHook');

let userAgent;


storePreferences.once('firstLoad', () => {
  initCallbackForPref();
});

storePreferences.on('mutate', preferences => {
  userAgent = preferences.napi.miscNonFetch.userAgent;
});

app.once('ready', () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const headers = details.requestHeaders;
    for (const key of Object.keys(headers)) {
      if (!/^user-?agent$/i.test(key)) {
        continue;
      }
      delete headers[key];
    }
    if (userAgent) {
      headers['User-Agent'] = userAgent;
    }
    callback({
      requestHeaders: headers,
    });
  });

  initCallbackForHook();
});
