// because protocol.registerStandardSchemes seems to override everything
// NOTE: secure option is enabled

import {app, protocol} from 'electron';


const schemeSet = new Set();

/**
 * registers specified scheme as a standard scheme
 * @param {string} scheme
 */
export default function registerStandardScheme(scheme) {
  if (app.isReady()) {
    throw new Error(`cannot register ${scheme} as a standard scheme: app is ready`);
  }

  if (schemeSet.has(scheme)) {
    return;
  }

  schemeSet.add(scheme);

  protocol.registerStandardSchemes(Array.from(schemeSet), {
    secure: true,
  });
}
