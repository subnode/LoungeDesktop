const $_callbackSet = new Set();


/**
 * gets the list of navigation callbacks
 * @returns {Function[]}
 */
export function $_get() {
  return Array.from($_callbackSet);
}

/**
 * adds navigation callback
 * the callback will be called from each router.beforeEach call
 * @param {Function} callback
 */
export function on(callback) {
  $_callbackSet.add(callback);
}

/**
 * removes specified navigation callback
 * @param {Function} callback
 */
export function remove(callback) {
  $_callbackSet.delete(callback);
}

/**
 * adds navigation callback
 * the callback will be removed after the first call
 * @param {Function} callback
 */
export function once(callback) {
  const wrapped = (...args) => {
    remove(wrapped);
    callback(...args);
  };
  on(wrapped);
}
