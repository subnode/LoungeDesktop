import xfi from './xfi';


const isProduction = process.env.NODE_ENV === 'production';

const ipcRenderer = xfi.ipc;


/**
 * adds a listener for specified channel
 * @param {string} channel
 * @param {Function} callback
 */
export function on(channel, callback) {
  ipcRenderer.on(channel, (event, data) => {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.log('on', channel, data ? JSON.parse(data) : undefined);
    }
    callback(data ? JSON.parse(data) : undefined, event);
  });
}

/**
 * sends a message to the main process through the channel
 * @param {string} channel
 * @param {*} data
 */
export function send(channel, data) {
  if (!isProduction) {
    // eslint-disable-next-line no-console
    console.log('send', channel, data);
  }
  ipcRenderer.send(channel, JSON.stringify(data) || '');
}
