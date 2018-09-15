// returns path to the base directory (i.e. the directory of package.json or __dirname in the main process)
// created because __dirname doesn't point to correct path in renderer processes

import {app} from 'electron';


const basePath = app.getAppPath();

export default basePath;
