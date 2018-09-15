<template></template>


<script>
import mixinError from './mixinError.js';
import mixinForceRoute from './mixinForceRoute.js';


export default {
  mixins: [
    mixinError,
    mixinForceRoute,
  ],
  created() {
    this.setError('pageInexistent', {
      fullPath: this.$route.fullPath,
      path: this.$route.path,
      query: this.$route.query,
    }, true);
    this.forceRoute('/', true);
  },
};
</script>
