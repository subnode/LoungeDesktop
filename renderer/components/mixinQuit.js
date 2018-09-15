import * as ipc from '../lib/ipc';


export default {
  methods: {
    quit() {
      ipc.send('quit');
    },
  },
};
