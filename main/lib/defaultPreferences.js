// provides better default preferences

import {app} from 'electron';

import {defaultPreferences} from '../../common/config';
import {localeIdSet} from '../../locales/index';


/**
 * @returns {Object}
 */
export default function getDefaultPreferences() {
  const preferredLocale = app.getLocale();
  const language = localeIdSet.has(preferredLocale) ? preferredLocale : defaultPreferences.language;

  return {
    ...defaultPreferences,
    language,
  };
}
