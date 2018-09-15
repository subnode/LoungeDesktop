import {app} from 'electron';

import {userDataDirectory} from './lib/mainConfig';


const isProduction = process.env.NODE_ENV === 'production';


// TODO: for some reason we're currently using default app directory
if (!isProduction) {
  app.setPath('userData', userDataDirectory);
  //console.log('userData directory set to', userDataDirectory);
}
