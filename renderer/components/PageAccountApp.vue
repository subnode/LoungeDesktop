<template>
<base-layout no-padding>
  <template slot="toolbar">
    <md-button class="button-home md-icon-button" to="/" @dragstart.native.prevent>
      <md-icon>home</md-icon>
      <md-tooltip>Return to the homepage</md-tooltip>
    </md-button>
    <md-button class="button-home md-icon-button" to=".." @dragstart.native.prevent>
      <md-icon>apps</md-icon>
      <md-tooltip>Return to the application list of {{account.name}}</md-tooltip>
    </md-button>
    <h1 class="title md-title">
      {{app.name}}
    </h1>
    <the-account-indicator :account="account"/>
    <md-menu md-direction="bottom-start" md-align-trigger>
      <md-button class="md-icon-button" md-menu-trigger>
        <md-icon>more_vert</md-icon>
        <md-tooltip md-direction="left">More&hellip;</md-tooltip>
      </md-button>
      <md-menu-content>
        <md-menu-item v-if="developerMode" @click="openWebviewDevTools">
          <md-icon class="md-primary">build</md-icon>
          <span class="menu-text">Open DevTools</span>
        </md-menu-item>
        <md-divider v-if="developerMode"/>
        <!-- divider -->
        <md-menu-item @click="showAccountInfoDialog = true">
          <md-icon class="md-primary">account_circle</md-icon>
          <span class="menu-text">Account information</span>
        </md-menu-item>
        <md-divider/>
        <!-- divider -->
        <md-menu-item to=".." @dragstart.prevent>
          <md-icon class="md-primary">apps</md-icon>
          <span class="menu-text">Application list</span>
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
      <webview
        ref="webview"
        :class="['webview', {loaded}]"
        @dom-ready="onWebviewDomReady"
        @did-stop-loading="onWebviewLoaded"
        @ipc-message="onWebviewIpcMessage"
        @new-window.prevent
      />
      <transition name="spinner">
        <div class="spinner-container" v-if="!loaded">
          <md-progress-spinner md-mode="indeterminate" class="spinner"/>
        </div>
      </transition>
    </div>

    <!-- snackbar shown on image saved -->
    <md-snackbar class="snackbar-image-saved" md-position="left" :md-active.sync="showImageSavedSnackbar" @md-closed="savedImageFilePath = ''">
      <span>
        Image has been saved to {{savedImageFilePath}}.
      </span>
      <md-button class="md-primary" @click="showImageSavedSnackbar = false">
        OK
      </md-button>
    </md-snackbar>

    <!-- dialog for sharing -->
    <md-dialog class="dialog-share" :md-active.sync="showShareDialog" :md-fullscreen="false" @md-closed="onShareDialogClosed">
      <md-dialog-title>Share</md-dialog-title>
      <md-dialog-content class="dialog-content-share md-scrollbar">
        <div class="share-container">
          <div class="share-image-container" v-if="!shareData.$$isPlaceholder">
            <div v-if="shareData.pending" class="share-image-placeholder">
              <md-progress-spinner md-mode="indeterminate" class="share-spinner"/>
            </div>
            <img v-else class="share-image" :src="shareData.imageUrl" @dragstart.prevent>
          </div>
          <div class="share-text-container">
            <md-field>
              <label>Text</label>
              <md-textarea v-model="shareData.text"></md-textarea>
            </md-field>
          </div>
          <div class="share-actions-container">
            <md-button class="md-raised md-primary" @click="saveShareImage">Save image</md-button>
            <!-- TODO: -->
          </div>
        </div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button @click="showShareDialog = false">Close</md-button>
      </md-dialog-actions>
    </md-dialog>

    <dialog-account-info :account="account" :show.sync="showAccountInfoDialog"/>
  </template>
</base-layout>
</template>


<script>
import Vue from 'vue';

import {appName} from '../../common/config';
import xfi from '../lib/xfi';
import * as ipc from '../lib/ipc';
import fetchShareImage from '../lib/fetchShareImage';

import BaseLayout from './BaseLayout.vue';
import DialogAccountInfo from './DialogAccountInfo.vue';
import TheAccountIndicator from './TheAccountIndicator.vue';
import mixinQuit from './mixinQuit.js';
import mixinPageAccount from './mixinPageAccount.js';
import mixinPageAccountApp from './mixinPageAccountApp.js';


const webviewNavigatedDelay = 1500;
const ipcRenderer = xfi.ipc;
const preload = xfi.toPreloadPath(FILENAMES.webviewPreloadJs, true);


export default Vue.extend({
  components: {
    BaseLayout,
    DialogAccountInfo,
    TheAccountIndicator,
  },
  mixins: [
    mixinQuit,
    mixinPageAccount,
    mixinPageAccountApp,
  ],
  data() {
    return {
      appName,
      launchData: null,
      webviewDomReady: false,
      loadWebviewCommitted: false,
      loaded: false,
      savedImageFilePath: '',
      showImageSavedSnackbar: false,
      showAccountInfoDialog: false,
      showShareDialog: false,
      shareData: {
        $$isPlaceholder: true,
        pending: false,
        text: '',
        imageUrl: null,
        originalImageUrl: null,
        mimeType: null,
        raw: {
          text: '',
          hashtags: [],
          imageUri: null,
        },
      },
    };
  },
  computed: {
    title$$() {
      return `${this.app.name} @ ${this.account.name} - ${appName}`
    },
    developerMode() {
      return this.$store.state.preferences.preferences.developerMode;
    },
    readyToLoadWebview() {
      return !!(this.launchData && this.webviewDomReady);
    },
    preferences() {
      return this.$store.state.preferences.preferences;
    },
  },
  watch: {
    readyToLoadWebview(curr) {
      if (curr) {
        this.loadWebview();
      }
    },
    preferences: {
      deep: true,
      handler(curr) {
        this.sendPreferences(curr);
      },
    },
  },
  created() {
    // fetch data which is needed for launching webapp
    ipc.on('appLaunchData', launchData => {
      if (this.launchData) {
        return;
      }
      if (launchData.accountId !== this.accountId || launchData.appId !== this.appId) {
        return;
      }
      this.launchData = launchData;
    });
    ipc.send('getAppLaunchData', {
      accountId: this.accountId,
      appId: this.appId,
    });
  },
  mounted() {
    const {webview} = this.$refs;
    let partition = `gwa-${this.accountId}-${this.appId}`;
    if (this.$store.state.preferences.preferences.persistWebviewSessions) {
      partition = `persisit:${partition}`;
    }
    webview.partition = partition;
    webview.preload = preload;
    // start loading
    webview.src = 'about:blank';
  },
  methods: {
    loadWebview() {
      if (this.loadWebviewCommitted) {
        return;
      }
      this.loadWebviewCommitted = true;

      const {webview} = this.$refs;
      webview.loadURL(this.launchData.url, {
        userAgent: this.launchData.userAgent || undefined,
        extraHeaders: this.launchData.headers,
      });
      webview.clearHistory();
      webview.getWebContents().on('will-navigate', (event, url) => {
        if (!url || /^about:/i.test(url)) {
          return;
        }
        const [, domain] = url.match(/^https?:\/\/([^\/]+)/) || [];
        if (domain && this.launchData.domains.includes(domain)) {
          return;
        }
        //console.log('prevent', url, domain);
        event.preventDefault();
      });
      if (this.$store.state.preferences.preferences.showWebviewOn === 'navigated') {
        setTimeout(() => {
          this.loaded = true;
        }, webviewNavigatedDelay);
      }
    },
    sendPreferences() {
      const {webview} = this.$refs;
      if (!webview) {
        return;
      }
      webview.getWebContents().send('@preferences', JSON.stringify(this.preferences));
    },
    openWebviewDevTools() {
      this.$refs.webview.openDevTools();
    },
    onWebviewDomReady() {
      this.webviewDomReady = true;
    },
    onWebviewLoaded() {
      //console.log('onWebviewLoaded', this.$refs.webview.getURL());
      if (!/^http/i.test(this.$refs.webview.getURL())) {
        // not gwa (about:blank)
        return false;
      }
      // hide spinner and show webview
      this.loaded = true;
    },
    onWebviewIpcMessage(event) {
      //console.log('ipcm', event);
      switch (event.channel) {
        case '@share':
          this.onGwaShare(event.args[0], event);
          return;

        case '@getPreferences':
          this.sendPreferences();
          return;
      }
      console.warn('unknown ipc message from the guest:', event);
    },
    onGwaShare(strShareObject, event_) {
      //console.log('onGwaShare', strShareObject, event_);
      let shareObject;
      try {
        shareObject = JSON.parse(strShareObject);
      } catch(error) {
        this.$store.commit('setError', {
          type: 'shareInteropError',
          data: {
            text: error.message,
          },
        });
        return;
      }
      const text = shareObject.text + ' ' + shareObject.hashtags.map(hashtag => `#${hashtag}`).join(' ');
      this.shareData = {
        $$isPlaceholder: false,
        pending: true,
        text,
        imageUrl: '',
        raw: shareObject,
      };
      this.showShareDialog = true;
      fetchShareImage(shareObject.image_url)
        .then(([blobUrl, response]) => {
          const contentType = response.headers.get('Content-Type');
          this.shareData = {
            $$isPlaceholder: false,
            pending: false,
            text,
            imageUrl: blobUrl,
            originalImageUrl: shareObject.image_url,
            mimeType: contentType,
            raw: shareObject,
          };
        })
        .catch(error => {
          this.$store.commit('setError', {
            type: 'shareInteropError',
            data: {
              text: error.message,
            },
          });
        });
    },
    saveShareImage() {
      const {imageUrl, originalImageUrl, mimeType} = this.shareData;
      if (!imageUrl || !originalImageUrl) {
        return;
      }
      let extension;
      if (mimeType && mimeType.startsWith('image/')) {
        extension = mimeType
          .replace(/^[^/]+\//, '')
          .replace(/\s*;.*$/, '');
        if (extension === 'jpeg') {
          extension = 'jpg';
        }
      } else {
        const filename = originalImageUrl
          .replace(/^([^/]*\/)+/, '');
        if (filename.contains('.')) {
          extension = filename.replace(/^([^.]*\.)+/, '');
        }
      }
      xfi.saveToDisk(imageUrl, {
        filters: [
          extension && {
            name: 'Images',
            extensions: [extension],
          },
          {
            name: 'All Files',
            extensions: ['*'],
          }
        ].filter(x => x),
      }).then(filePath => {
        if (filePath) {
          this.savedImageFilePath = filePath;
          this.showImageSavedSnackbar = true;
        }
      }).catch(error => {
        this.$store.commit('setError', {
          type: 'shareImageSaveError',
          data: {
            file: error.filePath,
            text: error.message,
          },
        });
      });
    },
    onShareDialogClosed() {
      const {imageUrl} = this.shareData;
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
      this.shareData.imageUrl = '';
      this.shareData.originalImageUrl = '';
      this.shareData.$$isPlaceholder = true;
    },
  },
});
</script>


<style>
@import url('styleRed.css');
</style>


<style scoped>
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

.webview, .spinner-container {
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


/* share */

.dialog-share {
  width: fit-content;
}

.dialog-content-share {
  padding-bottom: 0;
}

.share-image-container {
  margin-bottom: 1rem;
}

.share-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60vw;
  height: 40vw;
  background: rgba(255, 255, 255, .7);
  border-radius: 2px;
}

.share-image {
  max-height: 40vh;
  width: auto;
  border-radius: 2px;
}

.share-text-container {
  margin-bottom: .5rem;
}

.share-text {
  margin: 0;
  width: 100%;
}


/* transitions */

.webview {
  transition: opacity .5s;
}

.webview:not(.loaded) {
  visibility: hidden;
  opacity: 0;
}

.spinner-leave-active {
  transition: opacity .5s;
}

.spinner-leave-to {
  opacity: 0;
}
</style>
