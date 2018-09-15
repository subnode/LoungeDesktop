import ssInitialization from './lib/ssInitialization';


const supportedPlatforms = [
  'linux',
  'win32',
];

const {platform} = process;


/**
 * checks if the current platform is supported
 * @returns {Promise<void>}
 */
async function asyncCheckPlatform() {    // eslint-disable-line require-await
  if (!supportedPlatforms.includes(platform)) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
}


ssInitialization.registerInitialization('platformCheck', asyncCheckPlatform());
