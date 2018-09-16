<template>
<div>
  <md-snackbar class="snackbar-page-inexistent" md-position="left" :md-active.sync="pageInexistent$_$.show">
    <span>
      {{$t('TheErrorHandler.pageInexistent', [pageInexistent$_$.data.fullPath])}}
    </span>
    <md-button class="md-primary" @click="pageInexistent$_$.show = false">
      {{$t('button.OK')}}
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-account-removed" md-position="left" :md-active.sync="accountRemoved$_$.show">
    <i18n path="TheErrorHandler.accountRemoved" tag="span">
      <plate-account class="plate" :account="accountRemoved$_$.data" avatar-class="md-small"/>
    </i18n>
    <md-button class="md-primary" @click="accountRemoved$_$.show = false">
      {{$t('button.OK')}}
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-account-inexistent" md-position="left" :md-active.sync="accountInexistent$_$.show">
    <span>
      {{$t('TheErrorHandler.accountInexistent', [accountInexistent$_$.data])}}
    </span>
    <md-button class="md-primary" @click="accountInexistent$_$.show = false">
      {{$t('button.OK')}}
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-app-inexistent" md-position="left" :md-active.sync="appInexistent$_$.show">
    <i18n path="TheErrorHandler.appInexistent" tag="span">
      <span>{{appInexistent$_$.data.appId}}</span>
      <plate-account class="plate" :account="appInexistent$_$.data.account" avatar-class="md-small"/>
    </i18n>
    <md-button class="md-primary" @click="appInexistent$_$.show = false">
      {{$t('button.OK')}}
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-new-account-error" md-position="left" :md-active.sync="newAccountError$_$.show">
    <span>
      {{$t('TheErrorHandler.newAccountError')}}
      <br>
      {{newAccountError$_$.data}}
    </span>
    <md-button class="md-primary" @click="newAccountError$_$.show = false">
      {{$t('button.OK')}}
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-io-write-error" md-position="left" :md-active.sync="ioWriteError$_$.show">
    <span>
      {{$t('TheErrorHandler.ioWriteError', [ioWriteError$_$.data.file])}}
      <br>
      {{ioWriteError$_$.data.text}}
    </span>
    <md-button class="md-primary" @click="ioWriteError$_$.show = false">
      {{$t('button.OK')}}
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-api-request-error" md-position="left" :md-active.sync="apiRequestError$_$.show">
    <span>
      {{$t('TheErrorHandler.apiRequestError')}}
      <br>
      <template v-if="apiRequestError$_$.data.url">
        {{$t('TheErrorHandler.apiRequestErrorUrl', [apiRequestError$_$.data.url])}}
        <br>
      </template>
      {{apiRequestError$_$.data.text}}
    </span>
    <md-button class="md-primary" @click="apiRequestError$_$.show = false">
      {{$t('button.OK')}}
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-share-interop-error" md-position="left" :md-active.sync="shareInteropError$_$.show">
    <span>
      {{$t('TheErrorHandler.shareInteropError')}}
      <br>
      {{shareInteropError$_$.data.text}}
    </span>
    <md-button class="md-primary" @click="shareInteropError$_$.show = false">
      {{$t('button.OK')}}
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-share-image-save-error" md-position="left" :md-active.sync="shareImageSaveError$_$.show">
    <span>
      <template v-if="shareImageSaveError$_$.data.file">
        {{$t('TheErrorHandler.shareImageSaveError', [shareImageSaveError$_$.data.file])}}
      </template>
      <template v-else>
        {{$t('TheErrorHandler.shareImageSaveErrorWithoutFilePath')}}
      </template>
      <br>
      {{shareImageSaveError$_$.data.text}}
    </span>
    <md-button class="md-primary" @click="shareImageSaveError$_$.show = false">
      {{$t('button.OK')}}
    </md-button>
  </md-snackbar>
</div>
</template>


<script>
import {accountPlaceholder, appPlaceholder} from '../../common/config';

import PlateAccount from './PlateAccount.vue';


export default {
  components: {
    PlateAccount,
  },
  data() {
    return {
      pageInexistent$_$: {
        show: false,
        data: {
          fullPath: '/',
        },
      },
      accountRemoved$_$: {
        show: false,
        data: accountPlaceholder,
      },
      accountInexistent$_$: {
        show: false,
        data: accountPlaceholder.id,
      },
      appInexistent$_$: {
        show: false,
        data: {
          account: accountPlaceholder,
          appId: appPlaceholder.id,
        },
      },
      newAccountError$_$: {
        show: false,
        data: {
          text: '',
        },
      },
      ioWriteError$_$: {
        show: false,
        data: {
          file: '',
          text: '',
        },
      },
      apiRequestError$_$: {
        show: false,
        data: {
          url: '',
          text: '',
        },
      },
      shareInteropError$_$: {
        show: false,
        data: {
          text: '',
        },
      },
      shareImageSaveError$_$: {
        show: false,
        data: {
          file: '',
          text: '',
        },
      },
    };
  },
  computed: {
    errorExists() {
      return this.$store.getters.errorExists;
    },
    error() {
      return this.$store.state.error;
    },
  },
  watch: {
    error: {
      deep: true,
      handler() {
        this.$_handleError();
      },
    },
  },
  created() {
    this.$_handleError();
  },
  methods: {
    $_handleError() {
      if (!this.errorExists) {
        // no error was found
        return;
      }

      const {path} = this.error;
      if (path && path === this.$route.fullPath) {
        // the error should be shown at another route
        return;
      }

      const {type, data} = this.error;
      const thisData = this[type + '$_$'];
      if (!thisData) {
        // eslint-disable-next-line no-console
        console.error(`no such error: ${type}`);
        return;
      }
      thisData.show = true;
      thisData.data = data;

      // clear error
      // because operations which lead to recursion of watch function is forbidden, wrap mutation with setImmediate
      setTimeout(() => {
        this.$store.commit('clearError');
      }, 0);
    },
  },
};
</script>


<style scoped>
.snackbar-account-removed .plate {
  border-radius: 4px;
  background: rgba(255, 255, 255, .05);
  padding: 4px 6px;
}
</style>
