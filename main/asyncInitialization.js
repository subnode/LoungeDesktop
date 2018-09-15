import ssInitialization from './lib/ssInitialization';


/**
 * initializes asynchronous things
 */
export default new Promise((resolve, reject) => {
  ssInitialization.once('resolve', entries => {
    if (entries.some(([, value]) => value.error != null)) {
      reject(entries);
      return;
    }
    resolve(entries);
  });
});
