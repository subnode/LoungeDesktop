<template>
<transition name="bar">
  <div class="offline" v-show="!online">
    {{$t('TheOnlineChecker.text')}}
  </div>
</transition>
</template>


<script>
export default {
  data() {
    return {
      eventHandler: null,
      online: navigator.onLine,
    };
  },
  created() {
    const eventHandler = this.eventHandler = this.$_checkState.bind(this);
    window.addEventListener('online', eventHandler);
    window.addEventListener('offline', eventHandler);
    eventHandler();
  },
  destroyed() {
    const {eventHandler} = this;
    window.removeEventListener('online', eventHandler);
    window.removeEventListener('offline', eventHandler);
    this.eventHandler = null;
  },
  methods: {
    $_checkState() {
      this.online = navigator.onLine;
    },
  },
};
</script>


<style scoped>
.offline {
  text-align: center;
  font-weight: bold;
  background: rgba(255, 95, 15, .85);
  padding: .2rem;
}


/* transitions */

.bar-enter-active, .bar-leave-active {
  transition: all .8s;
  overflow-y: hidden;
}

.bar-enter, .bar-leave-to {
  max-height: 0;
  padding: 0;
}

.bar-enter-to, .bar-leave {
  max-height: 3rem;
}
</style>
