<template>
<base-layout>
  <template slot="toolbar">
    <md-button class="button-home md-icon-button" to="/" @dragstart.native.prevent>
      <md-icon>home</md-icon>
      <md-tooltip>{{$t('tooltip.ReturnToHome')}}</md-tooltip>
    </md-button>
    <h1 class="title md-title">
      {{$t('PagePreferences.title')}}
    </h1>
  </template>

  <template slot="content">
    <form class="md-layout md-gutter" @submit.prevent @reset.prevent>
      <div class="md-layout-item md-small-size-100 md-layout md-gutter pane">
        <div class="md-layout-item md-size-100 md-layout md-gutter indent">
          <div class="md-layout-item md-size-100">
            <md-field>
              <label for="language">
                {{$t('PagePreferences.Language')}}
                <template v-if="$t('PagePreferences.Language').toLowerCase() !== 'language'">
                  &#32;(Language)
                </template>
              </label>
              <md-select v-model="preferences.language" name="language" id="language">
                <md-option
                 v-for="locale in locales"
                 :key="locale.id"
                 :value="locale.id"
                >
                  {{locale.name}}
                  <template v-if="locale.localizedName">
                    &#32;({{locale.localizedName}})
                  </template>
                </md-option>
              </md-select>
            </md-field>
          </div>
          <div class="md-layout-item md-size-100">
            <md-field>
              <label for="theme">{{$t('PagePreferences.Theme')}}</label>
              <md-select v-model="preferences.theme" name="theme" id="theme">
                <md-option
                 v-for="theme in themes"
                 :key="theme.id"
                 :value="theme.id"
                >{{theme.name}}</md-option>
              </md-select>
            </md-field>
          </div>
          <div class="md-layout-item md-size-100">
            <md-switch class="md-primary" v-model="preferences.showNaInfo">
              {{$t('PagePreferences.showNaInfo')}}
            </md-switch>
          </div>
          <div class="md-layout-item md-size-100">
            <md-switch class="md-primary" v-model="preferences.applyCustomCssToWebview">
              {{$t('PagePreferences.applyCustomCssToWebview')}}
            </md-switch>
          </div>
          <div class="md-layout-item md-size-100">
            <md-switch class="md-primary" v-model="preferences.saveWindowSize">
              {{$t('PagePreferences.saveWindowSize')}}
            </md-switch>
          </div>
          <div class="md-layout-item md-size-50">
            <md-field>
              <label>{{$t('PagePreferences.WindowWidth')}}</label>
              <md-input type="number" min="0" v-model="preferences.windowSize.width"/>
            </md-field>
          </div>
          <div class="md-layout-item md-size-50">
            <md-field>
              <label>{{$t('PagePreferences.WindowHeight')}}</label>
              <md-input type="number" min="0" v-model="preferences.windowSize.height"/>
            </md-field>
          </div>
          <div class="md-layout-item md-size-100">
            <md-switch class="md-primary" v-model="preferences.persistWebviewSessions">
              {{$t('PagePreferences.PersistWebviewSessions')}}
            </md-switch>
          </div>
          <div class="md-layout-item md-large-size-100">
            <md-field>
              <label>{{$t('PagePreferences.loginOnStartupLabel')}}</label>
              <span class="md-prefix" v-if="$t('PagePreferences.loginOnStartupPrefix')">
                {{$t('PagePreferences.loginOnStartupPrefix')}}
              </span>
              <md-input type="number" min="-1" v-model.number="preferences.loginOnStartup"/>
              <span class="md-suffix" v-if="$t('PagePreferences.loginOnStartupSuffix')">
                {{$t('PagePreferences.loginOnStartupSuffix')}}
              </span>
              <md-tooltip>{{$t('PagePreferences.loginOnStartupTip')}}</md-tooltip>
            </md-field>
          </div>
          <div class="md-layout-item md-large-size-100">
            <md-field>
              <label>{{$t('PagePreferences.fetchAppListOnStartupLabel')}}</label>
              <span class="md-prefix" v-if="$t('PagePreferences.fetchAppListOnStartupPrefix')">
                {{$t('PagePreferences.fetchAppListOnStartupPrefix')}}
              </span>
              <md-input type="number" min="-1" v-model.number="preferences.fetchAppListOnStartup" :disabled="preferences.loginOnStartup === -1"/>
              <span class="md-suffix" v-if="$t('PagePreferences.fetchAppListOnStartupSuffix')">
                {{$t('PagePreferences.fetchAppListOnStartupSuffix')}}
              </span>
              <md-tooltip v-if="preferences.loginOnStartup !== -1">
                {{$t('PagePreferences.fetchAppListOnStartupTip')}}
              </md-tooltip>
              <md-tooltip v-else>
                {{$t('PagePreferences.fetchAppListOnStartupTipDisabled')}}
              </md-tooltip>
            </md-field>
          </div>
        </div><!-- .indent -->
      </div><!-- .pane -->

      <div class="md-layout-item md-small-size-100 md-layout md-gutter pane">
        <md-subheader class="md-layout-item md-size-100 md-primary">
          {{$t('PagePreferences.AdvancedConfiguration')}}
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
              <label>{{$t('PagePreferences.UserAgent')}}</label>
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
                <md-option value="true">{{$t('PagePreferences.true')}}</md-option>
                <md-option value="false">{{$t('PagePreferences.false')}}</md-option>
                <md-option value="auto">
                  {{$t('PagePreferences.Auto')}}
                  <md-tooltip>
                    {{$t('PagePreferences.isAnalyticsOptedInAutoTip')}}
                  </md-tooltip>
                </md-option>
              </md-select>
            </md-field>
          </div>
          <div class="md-layout-item md-small-size-100">
            <md-field>
              <label for="zncIaaoi">x-isappanalyticsoptedin</label>
              <md-select v-model="preferences.napi.znc.isAppAnalyticsOptedIn" name="zncIaaoi" id="zncIaaoi">
                <md-option value="true">{{$t('PagePreferences.true')}}</md-option>
                <md-option value="false">{{$t('PagePreferences.false')}}</md-option>
                <md-option value="auto">
                  {{$t('PagePreferences.Auto')}}
                  <md-tooltip>
                    {{$t('PagePreferences.isAppAnalyticsOptedInAutoTip', [preferences.napi.znc.isAnalyticsOptedIn])}}
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
              <label>{{$t('PagePreferences.UserAgent')}}</label>
              <md-input type="text" v-model="preferences.napi.na.userAgent"/>
            </md-field>
          </div>

          <md-subheader class="md-layout-item md-size-100">
            {{$t('PagePreferences.Webview')}}
          </md-subheader>
          <!-- div class="md-layout-item md-size-100">
            <md-field>
              <label>Proxy</label>
              <md-input type="text" v-model="preferences.napi.webview.proxy"/>
            </md-field>
          </div -->
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>{{$t('PagePreferences.UserAgent')}}</label>
              <md-input type="text" v-model="preferences.napi.webview.userAgent"/>
            </md-field>
          </div>

          <md-subheader class="md-layout-item md-size-100">
            {{$t('PagePreferences.miscFetch')}}
          </md-subheader>
          <!-- div class="md-layout-item md-size-100">
            <md-field>
              <label>Proxy</label>
              <md-input type="text" v-model="preferences.napi.miscFetch.proxy"/>
            </md-field>
          </div -->
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>{{$t('PagePreferences.UserAgent')}}</label>
              <md-input type="text" v-model="preferences.napi.miscFetch.userAgent"/>
            </md-field>
          </div>

          <md-subheader class="md-layout-item md-size-100">
            {{$t('PagePreferences.miscNonFetch')}}
          </md-subheader>
          <!-- div class="md-layout-item md-size-100">
            <md-field>
              <label>Proxy</label>
              <md-input type="text" v-model="preferences.napi.miscNonFetch.proxy"/>
            </md-field>
          </div -->
          <div class="md-layout-item md-size-100">
            <md-field>
              <label>{{$t('PagePreferences.UserAgent')}}</label>
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
import {appName, themes} from '../../common/config';
import {locales} from '../../locales/index';

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
      mutationFromRemote: false,
      locales,
      themes,
      preferences: clone(this.$store.state.preferences.preferences),
    };
  },
  computed: {
    title$$() {
      return this.$t('PagePreferences.windowTitle', [appName]);
    },
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
