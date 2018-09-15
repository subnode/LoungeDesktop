export default {
  methods: {
    clearError() {
      this.$store.commit('clearError');
    },
    setError(type, data = null, onNextRoute = false) {
      this.$store.commit('setError', {
        type,
        data,
        path: onNextRoute ? this.$route.fullPath : null,
      });
    },
  },
};
