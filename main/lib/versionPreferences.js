import {currentPreferencesFileVersion} from '../../common/config';


/**
 * @param {Object} oldPreferences
 * @returns {Object}
 */
export function migratePreferences(oldPreferences) {
  const oldVersion = oldPreferences.version;
  const preferences = JSON.parse(JSON.stringify(oldPreferences));

  switch (oldVersion) {
/*
    case 2:
      // ...
      // fallthrough

    case 3:
      // ...
      // fallthrough
//*/

    case currentPreferencesFileVersion:
      break;

    default:
      throw new Error(`unknown version: ${oldVersion}`);
  }

  return preferences;
}
