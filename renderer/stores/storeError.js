import * as ipc from '../lib/ipc';


const isProduction = process.env.NODE_ENV === 'production';

export default {
  state: {
    type: null,
    data: null,
    path: null,
  },
  mutations: {
    setError(state, payload) {
      if (!isProduction) {
        // eslint-disable-next-line no-console
        console.info('setError', payload);
      }

      if (payload == null || payload.type == null) {
        // clear
        state.type = null;
        state.data = null;
        state.path = null;
        return;
      }

      const {type, data, path} = payload;
      state.type = type;
      state.data = data;
      state.path = path || null;
    },
    clearError(state) {
      if (!isProduction) {
        // eslint-disable-next-line no-console
        console.info('clearError');
      }
      state.type = null;
      state.data = null;
      state.path = null;
    },
  },
  getters: {
    errorExists(state) {
      return state.type != null;
    },
  },
  actions: {
    $$init(context, store_) {
      ipc.on('error', data => {
        context.commit('setError', data);
      });
    },
  },
};
