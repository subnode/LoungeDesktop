<template>
<div>
  <md-snackbar class="snackbar-page-inexistent" md-position="left" :md-active.sync="pageInexistent$_$.show">
    <span>
      Page {{pageInexistent$_$.data.fullPath}} does not exist.
    </span>
    <md-button class="md-primary" @click="pageInexistent$_$.show = false">
      OK
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-account-removed" md-position="left" :md-active.sync="accountRemoved$_$.show">
    <span>
      Account&#32;<plate-account class="plate" :account="accountRemoved$_$.data" avatar-class="md-small"/>&#32;has been removed.
    </span>
    <md-button class="md-primary" @click="accountRemoved$_$.show = false">
      OK
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-account-inexistent" md-position="left" :md-active.sync="accountInexistent$_$.show">
    <span>
      Account {{accountInexistent$_$.data}} does not exist.
    </span>
    <md-button class="md-primary" @click="accountInexistent$_$.show = false">
      OK
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-app-inexistent" md-position="left" :md-active.sync="appInexistent$_$.show">
    <span>
      App {{appInexistent$_$.data.appId}} does not exist in account&#32;<plate-account class="plate" :account="appInexistent$_$.data.account" avatar-class="md-small"/>.
    </span>
    <md-button class="md-primary" @click="appInexistent$_$.show = false">
      OK
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-new-account-error" md-position="left" :md-active.sync="newAccountError$_$.show">
    <span>
      An error has occured while adding account:<br>
      {{newAccountError$_$.data}}.
    </span>
    <md-button class="md-primary" @click="newAccountError$_$.show = false">
      OK
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-io-write-error" md-position="left" :md-active.sync="ioWriteError$_$.show">
    <span>
      Failed to save {{ioWriteError$_$.data.file}}:<br>
      {{ioWriteError$_$.data.text}}
    </span>
    <md-button class="md-primary" @click="ioWriteError$_$.show = false">
      OK
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-api-request-error" md-position="left" :md-active.sync="apiRequestError$_$.show">
    <span>
      An error has occured during the API request:<br>
      <template v-if="apiRequestError$_$.data.url">
        [on {{apiRequestError$_$.data.url}}]:<br>
      </template>
      {{apiRequestError$_$.data.text}}
    </span>
    <md-button class="md-primary" @click="apiRequestError$_$.show = false">
      OK
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-share-interop-error" md-position="left" :md-active.sync="shareInteropError$_$.show">
    <span>
      Failed to process share data:<br>
      {{shareInteropError$_$.data.text}}
    </span>
    <md-button class="md-primary" @click="shareInteropError$_$.show = false">
      OK
    </md-button>
  </md-snackbar>

  <md-snackbar class="snackbar-share-image-save-error" md-position="left" :md-active.sync="shareImageSaveError$_$.show">
    <span>
      <template v-if="shareImageSaveError$_$.data.file">
        Failed to save image to {{shareImageSaveError$_$.data.file}}:<br>
      </template>
      <template v-else>
        Failed to save image:<br>
      </template>
      {{shareImageSaveError$_$.data.text}}
    </span>
    <md-button class="md-primary" @click="shareImageSaveError$_$.show = false">
      OK
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
