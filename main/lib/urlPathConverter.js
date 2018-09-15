import {URL} from 'url';

import {appHostname, appProtocol, appStartupPath, routerMode} from '../../common/config';


/**
 * returns path from specified URL
 * @param {string} url
 */
export function urlToPath(url) {
  const urlObject = new URL(url);
  return routerMode === 'history'
    ? urlObject.pathname
    : urlObject.hash.substr(1);
}

/**
 * converts specified path to URL
 * @param {string} path
 */
export function pathToUrl(path) {
  if (path[0] !== '/') {
    path = `/${path}`;
  }
  return routerMode === 'history'
    ? `${appProtocol}://${appHostname}${path}`
    : `${appProtocol}://${appHostname}${appStartupPath}#${path}`;
}
