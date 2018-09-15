import {EventEmitter} from 'events';

import * as ipc from '../lib/ipc.js';


class StoreActiveRoutes extends EventEmitter {
  constructor() {
    super();

    this.activeRouteMap = new Map();

    ipc.on('getActiveRoutes', (data, event) => {
      ipc.send('activeRoutes', this.$_getActiveRoutesWithoutSpecifiedWc.bind(this), event.sender);
    });

    ipc.on('routeUpdated', (routePath, event) => {
      const {id} = event.sender;
      this.activeRouteMap.set(id, routePath);
      this.$$onMutate(id);
    });
  }

  $_getActiveRoutesWithoutSpecifiedWc(webContents) {
    return Array.from(this.activeRouteMap.entries())
      .filter(([key]) => key !== webContents.id)
      .map(([, value]) => value)
      .filter(value => value);
  }

  $$onMutate(mutator) {
    ipc.broadcast('activeRoutes', this.$_getActiveRoutesWithoutSpecifiedWc.bind(this), mutator);
    // emit
    this.emit('mutate', this.activeRouteMap, mutator);
  }

  isRouteActive(routePath) {
    return Array.from(this.activeRouteMap.values()).includes(routePath);
  }

  getIdByRoute(routePath) {
    const entry = Array.from(this.activeRouteMap.entries())
      .find(([, value]) => value === routePath);
    return entry ? entry[0] : null;
  }

  deleteId(id) {
    this.activeRouteMap.delete(id);
    this.$$onMutate(id);
  }
}


export default new StoreActiveRoutes();
