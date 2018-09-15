import {defaultPreferences} from '../../common/config';


/**
 * retrieves preferences from LocalStorage
 * if failed, returns default preferences
 * @returns {Preferences}
 */
export function getPreferences() {
  const strPreferences = window.localStorage.getItem('preferences');

  let preferences = JSON.parse(JSON.stringify(defaultPreferences));
  if (strPreferences) {
    try {
      preferences = JSON.parse(strPreferences);
    } catch(error) { /* do nothing */ }
  }

  return preferences;
}

/**
 * stores preferences to LocalStorage
 * @param {Preferences} preferences
 */
export function setPreferences(preferences) {
  window.localStorage.setItem('preferences', JSON.stringify(preferences));
}
