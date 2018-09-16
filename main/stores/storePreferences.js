import {EventEmitter} from 'events';
import * as fs from 'fs';
import * as path from 'path';

import {currentPreferencesFileVersion} from '../../common/config';
import {userDataDirectory, preferencesFilename} from '../lib/mainConfig';
import getDefaultPreferences from '../lib/defaultPreferences';
import debounceWrapper from '../lib/debounce';
import * as ipc from '../lib/ipc';
import LdError from '../lib/Error';
import ssInitialization from '../lib/ssInitialization';
import {migratePreferences} from '../lib/versionPreferences';


class StorePreferences extends EventEmitter {
  constructor() {
    super();

    this.$_writingFileCount = 0;
    this.$_preferencesFilepath = path.join(userDataDirectory, preferencesFilename);
    this.preferences = {};
    this.firstLoadCompleted = false;

    this.$_debouncedSaveToFile = debounceWrapper(this.$_saveToFile.bind(this), 1000);

    const initCallback = ssInitialization.registerInitialization('loadPreferences');

    fs.readFile(this.$_preferencesFilepath, 'utf-8', (readError, data) => {
      try {
        if (readError) {
          if (readError.code !== 'ENOENT') {
            // error
            throw readError;
          }
          // first launch; use default preferences
          data = JSON.stringify(getDefaultPreferences());
        }
        // parse
        data = JSON.parse(data);
        // convert old version
        data = migratePreferences(data);
        // set version
        data.version = currentPreferencesFileVersion;
        // load
        this.$_loadPreferences(data);
        initCallback(null);
      } catch(error) {
        initCallback(error);
      }
      this.firstLoadCompleted = true;
      this.emit('firstLoad');
    });

    ipc.on('setPreferences', (preferences, event) => {
      this.setPreferences(preferences, event.sender.id);
    });

    ipc.on('getPreferences', (data_, event) => {
      ipc.send('preferences', this.preferences, event.sender.id);
    });
  }

  $$onMutate(mutator = null) {
    ipc.broadcast('preferences', this.preferences, mutator);

    // emit
    this.emit('mutate', this.preferences, mutator);

    // save
    this.$_debouncedSaveToFile();
  }

  $_saveToFile() {
    this.$_writingFileCount++;

    if (this.$_writingFileCount > 1) {
      return;
    }

    const data = JSON.stringify(this.preferences, null, 2);

    fs.writeFile(this.$_preferencesFilepath, data, 'utf-8', error => {
      const count = this.$_writingFileCount;
      this.$_writingFileCount = 0;

      if (count > 1) {
        process.nextTick(() => {
          this.$_saveToFile();
        });
      }

      if (error) {
        LdError.sendError({
          type: 'ioWriteError',
          data: {
            file: preferencesFilename,
            text: error.message,
          },
        });
      }
    });
  }

  $_loadPreferences(preferences) {
    this.preferences = preferences;
    this.$$onMutate();
  }

  setPreferences(preferences, mutator) {
    this.preferences = preferences;
    this.$$onMutate(mutator);
  }
}


export default new StorePreferences();
