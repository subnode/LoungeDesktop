/* eslint-disable no-invalid-this */


/**
 * wraps a function
 * @param {Function} callback
 * @param {number} minDuration
 * @returns {Function}
 */
export default function debounceWrapper(callback, minDuration) {
  let timerWorking = false;
  let lastCallOn = null;
  let applyParams = null;

  /**
   * wrapped function
   * @returns {undefined}
   */
  return function debounceWrapped(...args) {
    /**
     * execute
     */
    function execute() {
      lastCallOn = Date.now();
      callback.apply(...applyParams);
    }

    // update params
    applyParams = [this, ...args];

    if (timerWorking) {
      // execute by the timer
      return;
    }

    const elapsed = Date.now() - lastCallOn;
    if (lastCallOn != null && elapsed < minDuration) {
      // use timer
      timerWorking = true;
      setTimeout(() => {
        execute();
        timerWorking = false;
      }, minDuration - elapsed);
      return;
    }

    execute();
  };
}
