<template>
<div>
  <md-app md-mode="fixed" md-waterfall class="app">
    <md-app-toolbar class="app-toolbar md-primary">
      <slot name="toolbar"></slot>
    </md-app-toolbar>
    <md-app-content class="app-content md-scrollbar no-padding">
      <the-online-checker class="online-checker"/>
      <div :class="['content-container', contentContainerClass]">
        <slot name="content"></slot>
      </div>
    </md-app-content>
  </md-app>
  <the-error-handler/>
</div>
</template>


<script>
import TheErrorHandler from './TheErrorHandler.vue';
import TheOnlineChecker from './TheOnlineChecker.vue';


export default {
  components: {
    TheErrorHandler,
    TheOnlineChecker,
  },
  props: {
    noPadding: {
      type: Boolean,
      default: false,
    },
    noScrollHorizontal: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    contentContainerClass() {
      return {
        'no-padding': this.noPadding,
        'no-scroll-horizontal': this.noScrollHorizontal,
      };
    },
  },
};
</script>


<style scoped>
.app {
  height: 100vh;
}

.app-content {
  display: flex;
  flex-flow: column nowrap;
  border: none;
}

.online-checker {
  flex: 0 0 auto;
}

.content-container {
  flex: 1 1 0;
  padding: 15px;
}

.no-padding {
  padding: 0;
}

.no-scroll-horizontal {
  overflow-x: hidden;
}
</style>
