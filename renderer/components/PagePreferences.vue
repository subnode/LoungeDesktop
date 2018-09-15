<template>
<base-layout>
  <template slot="toolbar">
    <md-button class="button-home md-icon-button" to="/" @dragstart.native.prevent>
      <md-icon>home</md-icon>
      <md-tooltip>Return to the homepage</md-tooltip>
    </md-button>
    <h1 class="title md-title">
      Preferences
    </h1>
  </template>

  <template slot="content">
    <form class="md-layout md-gutter" @submit.prevent @reset.prevent>
      <div class="md-layout-item md-small-size-100 md-layout md-gutter pane">
        <div class="md-layout-item md-size-100 md-layout md-gutter indent">
          <div class="md-layout-item md-size-100">
            <md-field>
              <label for="theme">Theme</label>
              <md-select v-model="preferences.theme" name="theme" id="theme">
                <md-option value="RedDark">Red Dark</md-option>
                <md-option value="RedLight">Red Light</md-option>
                <md-option value="MonoDark">Mono Dark</md-option>
                <md-option value="MonoLight">Mono Light</md-option>
                <md-option value="VMDark">VM Dark</md-option>
                <md-option value="VMLight">VM Light</md-option>
              </md-select>
            </md-field>
          </div>
          <div class="md-layout-item md-size-100">
            <md-switch class="md-primary" v-model="preferences.showNaInfo">Show Nintendo Account information on the account list</md-switch>
          </div>
          <div class="md-layout-item md-size-100">
            <md-switch class="md-primary" v-model="preferences.applyCustomCssToWebview">Apply custom styles to webviews</md-switch>
          </div>
          <div class="md-layout-item md-size-100">
            <md-switch class="md-primary" v-model="preferences.saveWindowSize">Save window size</md-switch>
          </div>
          <div class="md-layout-item md-size-50">
            <md-field>
              <label>Window width</label>
              <md-input type="number" min="0" v-model="preferences.windowSize.width"/>
            </md-field>
          </div>
          <div class="md-layout-item md-size-50">
            <md-field>
              <label>Window height</label>
              <md-input type="number" min="0" v-model="preferences.windowSize.height"/>
            </md-field>
          </div>
          <div class="md-layout-item md-size-100">
            <md-switch class="md-primary" v-model="preferences.persistWebviewSessions">Persist webview sessions</md-switch>
          </div>
          <div class="md-layout-item md-large-size-100">
            <md-field>
              <label>Prefetch all accounts' tokens</label>
              <md-input type="number" min="-1" v-model.number="preferences.loginOnStartup"/>
              <span class="md-suffix">msec. after startup</span>
              <md-tooltip>Set -1 to disable</md-tooltip>
            </md-field>
          </div>
          <div class="md-layout-item md-large-size-100">
            <md-field>
              <label>Prefetch all accounts' application list</label>
              <md-input type="number" min="-1" v-model.number="preferences.fetchAppListOnStartup" :disabled="preferences.loginOnStartup === -1"/>
              <span class="md-suffix">msec. after fetching tokens</span>
              <md-tooltip v-if="preferences.loginOnStartup === -1">This is disabled because token prefetch is disabled</md-tooltip>
              <md-tooltip v-else>Set -1 to disable</md-tooltip>
            </md-field>
          </div>
        </div><!-- .indent -->
      </div><!-- .pane -->

      <div class="md-layout-item md-small-size-100 md-layout md-gutter pane">
        <md-subheader class="md-layout-item md-size-100 md-primary">
          Advanced configuration
        </md-subheader>
        <div class="md-layout-item md-size-100 md-layout md-gutter indent">
          <md-subheader class="md-layout-item md-size-100">
            Znc (<code>*.znc.srv.nintendo.net</code>)
          </md-subheader>
          <!-- div class="md-layout-item md-size-100">
            <md-field>
              <label>Proxy</label>
              <md-input type="text" v-model="preferences.napi.znc.proxy"/>
            </md-field>
          </div -->
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>User agent</label>
              <md-input type="text" v-model="preferences.napi.znc.userAgent"/>
            </md-field>
          </div>
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>X-Platform</label>
              <md-input type="text" v-model="preferences.napi.znc.xPlatform"/>
            </md-field>
          </div>
          <div class="md-layout-item md-small-size-100">
            <md-field>
              <label for="zncIaoi">x-isanalyticsoptedin</label>
              <md-select v-model="preferences.napi.znc.isAnalyticsOptedIn" name="zncIaoi" id="zncIaoi">
                <md-option value="true">true</md-option>
                <md-option value="false">false</md-option>
                <md-option value="auto">
                  Auto
                  <md-tooltip>
                    Use the value retrieved from your account.
                  </md-tooltip>
                </md-option>
              </md-select>
            </md-field>
          </div>
          <div class="md-layout-item md-small-size-100">
            <md-field>
              <label for="zncIaaoi">x-isappanalyticsoptedin</label>
              <md-select v-model="preferences.napi.znc.isAppAnalyticsOptedIn" name="zncIaaoi" id="zncIaaoi">
                <md-option value="true">true</md-option>
                <md-option value="false">false</md-option>
                <md-option value="auto">
                  Auto
                  <md-tooltip>
                    Use the value of x-isanalyticsoptedin ({{preferences.napi.znc.isAnalyticsOptedIn}}).
                  </md-tooltip>
                </md-option>
              </md-select>
            </md-field>
          </div>

          <md-subheader class="md-layout-item md-size-100">
            Na (<code>*.accounts.nintendo.net</code>)
          </md-subheader>
          <!-- div class="md-layout-item md-size-100">
            <md-field>
              <label>Proxy</label>
              <md-input type="text" v-model="preferences.napi.na.proxy"/>
            </md-field>
          </div -->
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>User agent</label>
              <md-input type="text" v-model="preferences.napi.na.userAgent"/>
            </md-field>
          </div>

          <md-subheader class="md-layout-item md-size-100">
            Webview
          </md-subheader>
          <!-- div class="md-layout-item md-size-100">
            <md-field>
              <label>Proxy</label>
              <md-input type="text" v-model="preferences.napi.webview.proxy"/>
            </md-field>
          </div -->
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>User agent</label>
              <md-input type="text" v-model="preferences.napi.webview.userAgent"/>
            </md-field>
          </div>

          <md-subheader class="md-layout-item md-size-100">
            Misc. fetch (share images)
          </md-subheader>
          <!-- div class="md-layout-item md-size-100">
            <md-field>
              <label>Proxy</label>
              <md-input type="text" v-model="preferences.napi.miscFetch.proxy"/>
            </md-field>
          </div -->
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>User agent</label>
              <md-input type="text" v-model="preferences.napi.miscFetch.userAgent"/>
            </md-field>
          </div>

          <md-subheader class="md-layout-item md-size-100">
            Misc. (account images, app images, etc.)
          </md-subheader>
          <!-- div class="md-layout-item md-size-100">
            <md-field>
              <label>Proxy</label>
              <md-input type="text" v-model="preferences.napi.miscNonFetch.proxy"/>
            </md-field>
          </div -->
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>User agent</label>
              <md-input type="text" v-model="preferences.napi.miscNonFetch.userAgent"/>
            </md-field>
          </div>
        </div><!-- .indent -->
      </div><!-- .pane -->
    </form>
  </template>
</base-layout>
</template>


<script>
import {appName} from '../../common/config';

import BaseLayout from './BaseLayout.vue';


function clone(object) {
  return JSON.parse(JSON.stringify(object));
}


export default {
  components: {
    BaseLayout,
  },
  data() {
    return {
      title$$: `Preferences - ${appName}`,
      mutationFromRemote: false,
      preferences: clone(this.$store.state.preferences.preferences),
    };
  },
  computed: {
    $_storePreferences() {
      return this.$store.state.preferences.preferences;
    },
  },
  created() {
    this.$_fetchRemotePreferences();
  },
  watch: {
    preferences: {
      deep: true,
      handler(curr) {
        if (this.mutationFromRemote) {
          this.mutationFromRemote = false;
          return;
        }
        this.$_commitLocalPreferences(curr);
      },
    },
    $_storePreferences: {
      deep: true,
      handler(curr) {
        this.$_fetchRemotePreferences(curr);
      },
    },
  },
  methods: {
    $_commitLocalPreferences(local) {
      this.$store.commit('setPreferences', clone(local || this.preferences));
    },
    $_fetchRemotePreferences(remote) {
      this.mutationFromRemote = true;
      this.preferences = clone(remote || this.$store.state.preferences.preferences);
    },
  },
};
</script>


<style scoped>
.title {
  flex: 1;
}

.indent {
  padding-left: 1.25rem !important;
}
</style>
