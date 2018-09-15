import {app} from 'electron';

import {clientId} from '../../common/napiConfig';
import Na from './napi/Na';


export const protocol = Na.generateRedirectUriProtocol(clientId);

/**
 * registers protocol handler of authorization callback
 * @returns {boolean}
 */
export function registerProtocolHandler() {
  return app.setAsDefaultProtocolClient(protocol);
}

/**
 * unregisters protocol handler of authorization callback
 */
export function unregisterProtocolHandler() {
  app.removeAsDefaultProtocolClient(protocol);
}

/**
 * registers protocol handler of authorization callback
 * @returns {boolean}
 */
export function isProtocolHandlerRegistered() {
  return app.isDefaultProtocolClient(protocol);
}
