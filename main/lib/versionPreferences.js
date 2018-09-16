import {currentPreferencesFileVersion} from '../../common/config';
import getDefaultPreferences from './defaultPreferences';


/**
 * @param {Object} oldPreferences
 * @returns {Object}
 */
export function migratePreferences(oldPreferences) {
  const oldVersion = oldPreferences.version;
  const preferences = JSON.parse(JSON.stringify(oldPreferences));

  const defaultPreferences = getDefaultPreferences();

  switch (oldVersion) {
    case 1:
      preferences.language = defaultPreferences.language;
      // fallthrough

    case currentPreferencesFileVersion:
      break;

    default:
      throw new Error(`unknown version: ${oldVersion}`);
  }

  return preferences;
}
