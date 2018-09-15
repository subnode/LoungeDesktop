import * as ipc from '../lib/ipc';
import {once as setNavigationCallbackOnce} from '../lib/ssNavigationCallbacks';


export default {
  methods: {
    forceRoute(to, propagateError = true) {
      setNavigationCallbackOnce((canNavigate, to) => {
        if (!canNavigate) {
          if (propagateError && this.$store.getters.errorExists) {
            ipc.send('#send', {
              channel: 'error',
              to: to.fullPath,
              data: this.$store.state.error,
            });
          }
          window.close();
        }
      });
      this.$router.push(to);
    },
  },
};
