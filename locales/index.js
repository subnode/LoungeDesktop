// see https://electronjs.org/docs/api/locales for locale codes

import * as allLocales from './all';


/**
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function compareString(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}


export const locales = Object.values(allLocales)
  .map(({id, name, localizedName}) => ({
    id,
    name,
    localizedName,
  }))
  .sort((a, b) => compareString(a.name.toLowerCase(), b.name.toLowerCase()));

export const localeIdSet = new Set(locales.map(locale => locale.id));

export const messages = Object.values(allLocales).reduce((acc, {id, name, localizedName, text}) => (acc[id] = {
  name,
  localizedName,
  ...text,
}, acc), {});
