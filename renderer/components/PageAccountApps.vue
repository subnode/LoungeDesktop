<template>
<base-layout>
  <template slot="toolbar">
    <md-button class="button-home md-icon-button" to="/" @dragstart.native.prevent>
      <md-icon>home</md-icon>
      <md-tooltip>Return to the homepage</md-tooltip>
    </md-button>
    <h1 class="title md-title">
      Applications
    </h1>
    <the-account-indicator :account="account"/>
    <md-menu md-direction="bottom-start" md-align-trigger>
      <md-button class="md-icon-button" md-menu-trigger>
        <md-icon>more_vert</md-icon>
        <md-tooltip md-direction="left">More&hellip;</md-tooltip>
      </md-button>
      <md-menu-content>
        <md-menu-item @click="showAccountInfoDialog = true">
          <md-icon class="md-primary">account_circle</md-icon>
          <span class="menu-text">Account information</span>
        </md-menu-item>
        <md-divider/>
        <!-- divider -->
        <md-menu-item to="/" @dragstart.prevent>
          <md-icon class="md-primary">home</md-icon>
          <span class="menu-text">Homepage</span>
        </md-menu-item>
        <md-menu-item to="/preferences" @dragstart.prevent>
          <md-icon class="md-primary">settings</md-icon>
          <span class="menu-text">Preferences</span>
        </md-menu-item>
        <md-menu-item to="/about" target="_blank" @dragstart.prevent>
          <md-icon class="md-primary">info</md-icon>
          <span class="menu-text">About {{appName}}</span>
        </md-menu-item>
        <md-divider/>
        <!-- divider -->
        <md-menu-item @click="quit">
          <md-icon class="ld-red">close</md-icon>
          <span class="menu-text">Quit Lounge Desktop</span>
        </md-menu-item>
      </md-menu-content>
    </md-menu>
  </template>

  <template slot="content">
    <div class="container">
      <!-- spinner -->
      <transition name="spinner">
        <div class="spinner-container" v-if="!appsFetched">
          <md-progress-spinner md-mode="indeterminate" class="spinner"/>
        </div>
      </transition>
      <!-- application list -->
      <transition name="apps">
        <div class="apps-container" v-show="appsFetched && apps.length">
          <div class="apps" ref="apps" @dragstart.prevent>
            <router-link
              v-for="app in apps"
              :key="app.id"
              class="app md-elevation-4"
              :style="appStyle"
              :to="app.id.toString()"
              append
            >
              <md-ripple class="app-container">
                <img class="app-image" :src="app.imageUri">
                <div class="app-name">{{app.name}}</div>
              </md-ripple>
            </router-link>
            <div
              v-for="app in apps"
              :key="`$_padding-${app.id}`"
              v-show="appPaddingNeeded"
              class="app-padding"
              :style="appStyle"
            ></div>
          </div>
        </div>
      </transition>
      <!-- on no applications -->
      <div class="no-apps-container">
        <md-empty-state
          v-if="appsFetched && !apps.length"
          class="no-apps"
          md-icon="apps"
          md-label="No applications"
          md-description="Your account seems to have no applications."
        ></md-empty-state>
      </div>
    </div>

    <dialog-account-info :account="account" :show.sync="showAccountInfoDialog"/>
  </template>
</base-layout>
</template>


<script>
import Vue from 'vue';

import {appName} from '../../common/config';

import BaseLayout from './BaseLayout.vue';
import DialogAccountInfo from './DialogAccountInfo.vue';
import TheAccountIndicator from './TheAccountIndicator.vue';
import mixinQuit from './mixinQuit.js';
import mixinPageAccount from './mixinPageAccount.js';


export default Vue.extend({
  components: {
    BaseLayout,
    DialogAccountInfo,
    TheAccountIndicator,
  },
  mixins: [
    mixinQuit,
    mixinPageAccount,
  ],
  data() {
    return {
      appName,
      onResizeListener: null,
      showAccountInfoDialog: false,
      appPaddingNeeded: false,
      appStyleConfig: {
        minSize: 160,
        maxSize: 240,
        lrMargin: 10,
        tbMargin: 15,
      },
    };
  },
  computed: {
    title$$() {
      return `@ ${this.account.name} - ${appName}`;
    },
    appStyle() {
      const config = this.appStyleConfig;
      return {
        minWidth: `${config.minSize}px`,
        maxWidth: `${config.maxSize}px`,
        margin: `${config.tbMargin}px ${config.lrMargin}px`,
      };
    },
    apps() {
      //return [];
      /*
      const apps = [...this.account.$$apps] || [];
      if (apps.length) {
        while (apps.length < 7) {
          apps.push({
            ...apps[0],
            id: parseInt(Math.random().toString().substr(2), 10),
          });
        }
      }
      return apps;
      //*/
      return this.account.$$apps || [];
    },
    appsFetched() {
      return !this.account.$$isPlaceholder && this.account.$$appsFetched;
    },
  },
  watch: {
    apps() {
      this.checkAppPaddingNecessity();
    },
    appStyleConfig() {
      this.checkAppPaddingNecessity();
    },
  },
  beforeMount() {
    this.onResizeListener = () => {
      this.checkAppPaddingNecessity();
    };
    window.addEventListener('resize', this.onResizeListener);
  },
  created() {
    this.$store.dispatch('fetchAccountApps', this.accountId);
  },
  mounted() {
    this.checkAppPaddingNecessity();
  },
  destroyed() {
    window.removeEventListener('resize', this.onResizeListener);
    this.onResizeListener = null;
  },
  methods: {
    checkAppPaddingNecessity() {
      const appsElement = this.$refs.apps;
      if (!appsElement) {
        this.appPaddingNeeded = false;
        return;
      }
      const numApps = this.apps.length;

      const appsElementBcRect = appsElement.getBoundingClientRect();
      const appsElementWidth = appsElementBcRect.right - appsElementBcRect.left;
      const minAppListWidth = (this.appStyleConfig.minSize + this.appStyleConfig.lrMargin * 2) * numApps;

      this.appPaddingNeeded = minAppListWidth > appsElementWidth;
    },
  },
});
</script>


<style>
@import url('styleRed.css');
</style>


<style scoped>
:root {
  --app-border-radius: 3px;
}

.title {
  flex: 1;
}

.menu-text {
  width: 100%;
}

.container {
  position: relative;
  width: 100%;
  height: 100%;
}

.spinner-container, .apps-container, .no-apps-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.apps {
  display: flex;
  flex-flow: row wrap;
  user-select: none;
}

.app, .app-padding {
  flex: 1 0 0;
  display: block;
  box-sizing: border-box;
}

.app-padding {
  height: 0;
}

.app {
  position: relative;
}

.app, .app-image {
  border-radius: var(--app-border-radius);
}

.app::before {
  content: '';
  display: block;
  padding-top: 100%;
}

.app-container {
  position: absolute;
  top: 0;
  left: 0;
  color: #fff;    /* color of ripple */
}

.app-image {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-name {
  display: block;
  box-sizing: border-box;
  width: 100%;
  padding: .4em 1em;
  border-bottom-left-radius: var(--app-border-radius);
  border-bottom-right-radius: var(--app-border-radius);
  position: absolute;
  bottom: 0;
  background: rgba(0, 0, 0, .6);
  color: #FFF;
  font-weight: 500;
  text-shadow: rgba(0, 0, 0, .3) 1.5px 1px;
}


/* transitions */

.spinner-leave-active, .apps-enter-active  {
  transition: opacity .5s;
}

.spinner-leave-to, .apps-enter {
  opacity: 0;
}
</style>
