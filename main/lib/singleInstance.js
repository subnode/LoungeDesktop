import {app} from 'electron';
import {EventEmitter} from 'events';


class SingleInstance extends EventEmitter {
  constructor() {
    super();

    this.isFirstInstance = !app.makeSingleInstance(this.$$onSecondInstance.bind(this));
  }

  $$onSecondInstance(argv, workingDirectory) {
    this.emit('newInstance', argv, workingDirectory);
  }
}


export default new SingleInstance();
