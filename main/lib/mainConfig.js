import {app} from 'electron';
import * as path from 'path';


const isProduction = process.env.NODE_ENV === 'production';
const isPacked = !/electron(?:\.exe)$/i.test(process.argv[0]);

// TODO: make this configurable
// TODO: for some reason we're currently using default app directory
export const userDataDirectory = isProduction ? app.getPath('userData') : path.join(isPacked ? app.getPath('exe') : __filename, '..', '.userdata');

export const preferencesFilename = '.preferences.json';

export const accountsFilename = '.accounts.json';
