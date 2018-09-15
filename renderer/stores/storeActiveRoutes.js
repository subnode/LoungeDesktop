import * as ipc from '../lib/ipc';


export default {
  state: {
    $_fetched: false,
    activeRoutes: [],
  },
  mutations: {
    $_setActiveRoutes(state, routePaths) {
      state.$_fetched = true;
      state.activeRoutes = routePaths;
    },
  },
  getters: {
    isActiveRoutesFetched(state) {
      return state.$_fetched;
    },
    isRouteActive(state) {
      return routePath => state.activeRoutes.includes(routePath);
    },
  },
  actions: {
    $$init(context, store_) {
      ipc.on('activeRoutes', routePaths => {
        context.commit('$_setActiveRoutes', routePaths);
      });
      context.dispatch('fetchActiveRoutes');
    },
    fetchActiveRoutes(context_) {
      ipc.send('getActiveRoutes');
    },
  },
};
