import {app} from 'electron';


const openControlHandlerSet = new Set();
let onNewWindowCallback;


/**
 * @param {Function} callback
 */
export function addOpenControlHandler(callback) {
  openControlHandlerSet.add(callback);
}

/**
 * @param {Function} callback
 */
export function removeOpenControlHandler(callback) {
  openControlHandlerSet.delete(callback);
}

/**
 * @param {Function} callback
 */
export function setNewWindowCallback(callback) {
  onNewWindowCallback = callback;
}


app.on('web-contents-created', (appEvent_, contents) => {
  contents.on('new-window', (...args) => {
    const [event] = args;
    for (const handler of openControlHandlerSet) {
      if (!handler(contents, ...args)) {
        // eslint-disable-next-line no-console
        console.warn('new-window cancelled', handler, ...args);
        event.preventDefault();
        return;
      }
    }
    if (onNewWindowCallback) {
      onNewWindowCallback(contents, ...args);
    }
  });
});
