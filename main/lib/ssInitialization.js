import {EventEmitter} from 'events';


class SsInitializaton extends EventEmitter {
  constructor() {
    super();

    this.$_registrationClosed = false;
    process.nextTick(() => {
      this.$_registrationClosed = true;
    });

    this.$_resolvedMap = new Map();
  }

  $_checkAllResolved() {
    const entries = Array.from(this.$_resolvedMap.entries());
    if (entries.some(([, value]) => value == null)) {
      // not all resolved yet
      return;
    }
    this.emit('resolve', entries);
  }

  registerInitialization(key, promise = null) {
    if (this.$_registrationClosed) {
      throw new Error(`registerInitialization must be called on the first tick of process (${key})`);
    }
    if (this.$_resolvedMap.has(key)) {
      throw new Error(`Key ${key} is already registered`);
    }

    this.$_resolvedMap.set(key, null);

    const callback = error => {
      if (this.$_resolvedMap.get(key) != null) {
        throw new Error(`Key ${key} is already resolved`);
      }
      this.$_resolvedMap.set(key, {
        error,
      });
      process.nextTick(() => {
        this.$_checkAllResolved();
      });
    };

    if (promise) {
      promise
        .then(() => callback(null))
        .catch(error => callback(error));
      return null;
    }

    return callback;
  }
}


export default new SsInitializaton();
