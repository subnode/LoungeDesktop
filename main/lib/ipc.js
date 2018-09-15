import {ipcMain, webContents} from 'electron';


const isProduction = process.env.NODE_ENV === 'production';

/**
 * @param {string} channel
 * @param {Object|Function} data
 * @param {Number|webContents|(Number|webContents)[]} destinations
 */
export function send(channel, data, destinations) {
  if (!Array.isArray(destinations)) {
    destinations = [destinations];
  }
  if (!isProduction) {
    // eslint-disable-next-line no-console
    console.log('send', channel, data, destinations);
  }
  for (let destination of destinations) {
    if (!destination.send) {
      destination = webContents.fromId(destination);
      if (!destination) {
        continue;
      }
    }
    const sendData = typeof data === 'function' ? data(destination) : data;
    destination.send(channel, JSON.stringify(sendData) || '');
  }
}

/**
 * @param {string} channel
 * @param {Object|Function} data
 * @param {Number|webContents|(Number|webContents)[]} excludes
 */
export function broadcast(channel, data, excludes = []) {
  excludes = excludes || [];
  if (!Array.isArray(excludes)) {
    excludes = [excludes];
  }
  if (!isProduction) {
    // eslint-disable-next-line no-console
    console.log('broadcast', channel, data, excludes);
  }
  for (const destination of webContents.getAllWebContents()) {
    if (excludes.includes(destination) || excludes.includes(destination.id)) {
      continue;
    }
    const sendData = typeof data === 'function' ? data(destination) : data;
    destination.send(channel, JSON.stringify(sendData) || '');
  }
}

/**
 * @param {string} channel
 * @param {Function} callback
 */
export function on(channel, callback) {
  ipcMain.on(channel, (event, data) => {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.log('on', channel, data ? JSON.parse(data) : undefined);
    }
    callback(data ? JSON.parse(data) : undefined, event);
  });
}
