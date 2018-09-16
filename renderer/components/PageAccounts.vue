<template>
<base-layout :class="{managing: managingAccounts}" no-scroll-horizontal>
  <template slot="toolbar">
    <h1 class="title md-title">
      {{$t('PageAccounts.title', [appName])}}
    </h1>
    <md-menu md-direction="bottom-start" md-align-trigger>
      <md-button class="md-icon-button" md-menu-trigger>
        <md-icon>more_vert</md-icon>
        <md-tooltip md-direction="left">{{$t('More')}}</md-tooltip>
      </md-button>
      <md-menu-content>
        <!-- -->
        <md-menu-item v-if="!managingAccounts" v-show="accounts.length" @click="startManagingAccounts">
          <md-icon class="md-primary">edit</md-icon>
          <span class="menu-text">{{$t('PageAccounts.ManageAccounts')}}</span>
        </md-menu-item>
        <md-menu-item v-else @click="finishManagingAccounts">
          <md-icon class="md-primary">done</md-icon>
          <span class="menu-text">{{$t('PageAccounts.FinishManagingAccounts')}}</span>
        </md-menu-item>
        <!-- -->
        <md-menu-item @click="addAccount" :disabled="accountLimitReached">
          <md-icon class="md-primary">person_add</md-icon>
          <span class="menu-text">{{$t('PageAccounts.AddAccount')}}</span>
        </md-menu-item>
        <md-menu-item @click="showAddAccountByUrlDialog = true" :disabled="accountLimitReached || !addAccountStatus.pendingCount">
          <md-icon class="md-primary">input</md-icon>
          <span class="menu-text">{{$t('PageAccounts.AddAccountByUrl')}}</span>
        </md-menu-item>
        <md-divider/>
        <!-- divider -->
        <md-menu-item to="/preferences" @dragstart.prevent>
          <md-icon class="md-primary">settings</md-icon>
          <span class="menu-text">{{$t('menu.Preferences')}}</span>
        </md-menu-item>
        <md-menu-item to="/about" target="_blank" @dragstart.prevent>
          <md-icon class="md-primary">info</md-icon>
          <span class="menu-text">{{$t('menu.About', [appName])}}</span>
        </md-menu-item>
        <md-divider/>
        <!-- divider -->
        <md-menu-item @click="quit">
          <md-icon class="ld-red">close</md-icon>
          <span class="menu-text">{{$t('menu.Quit', [appName])}}</span>
        </md-menu-item>
      </md-menu-content>
    </md-menu>
  </template>

  <template slot="content">
    <!-- account list (normal) -->
    <template>
      <transition-group
        v-show="!managingAccounts && accounts.length"
        name="accounts-list"
        tag="md-list"
        class="accounts"
      >
        <md-list-item
          class="account-item"
          v-for="account in accounts"
          :key="account.id"
          :to="account.id.toString()"
          append
          @dragstart.prevent
        >
          <md-avatar class="account-avatar">
            <img :src="account.imageUri" @dragstart.prevent>
          </md-avatar>
          <div class="account-name md-list-item-text">
            <span>{{account.name}}</span>
            <span v-if="showNaInfo" class="account-name-sub">
              {{account.znc.naAccountInfo.nickname}} ({{account.znc.naAccountInfo.screenName}})
            </span>
          </div>
          <md-button class="md-list-action md-icon-button" @click.stop.prevent="startAccountInfoDialog(account)" @mousedown.stop>
            <md-icon>info</md-icon>
            <md-tooltip>{{$t('PageAccounts.tipShowAccountInfo', [account.name])}}</md-tooltip>
          </md-button>
        </md-list-item>
      </transition-group>
      <!-- actions (speed dial) -->
      <md-speed-dial v-show="!managingAccounts && accounts.length" class="md-bottom-right">
        <md-speed-dial-target @click="addAccount" :disabled="accountLimitReached">
          <md-icon>person_add</md-icon>
          <md-tooltip md-direction="left">
            {{$t('PageAccounts.AddAccount')}}
            <template v-if="accountLimitReached">
              &#32;{{$t('PageAccounts.upToSupported', [maxAccounts])}}
            </template>
          </md-tooltip>
        </md-speed-dial-target>
        <md-speed-dial-content>
          <md-button class="md-icon-button" @click="startManagingAccounts">
            <md-icon>edit</md-icon>
            <md-tooltip md-direction="left">{{$t('PageAccounts.ManageAccounts')}}</md-tooltip>
          </md-button>
        </md-speed-dial-content>
      </md-speed-dial>
    </template>
    <!-- account list for managing -->
    <template v-if="managingAccounts">
      <vue-draggable
        v-show="managingAccounts && accounts.length"
        :list="accountsProxy"
        :options="{handle: '.account-thumb', disabled: !draggable}"
        @start="draggingAccountId = parseInt($event.item.dataset.id, 10)"
        @end="draggingAccountId = null"
      >
        <transition-group
          name="accounts-list"
          tag="md-list"
          :class="['accounts', 'accounts-managing', {draggable, dragging: draggingAccountId != null}]"
        >
          <md-list-item
            v-for="account in accounts"
            :key="account.id"
            class="account-item"
            :data-id="account.id"
          >
            <span>
              <md-icon class="account-thumb">menu</md-icon>
              <md-tooltip>{{$t('PageAccounts.tipDragToMove', [account.name])}}</md-tooltip>
            </span>
            <md-avatar class="account-avatar">
              <img :src="account.imageUri" @dragstart.prevent>
            </md-avatar>
            <div class="account-name md-list-item-text">
              <span>{{account.name}}</span>
              <span v-if="showNaInfo" class="account-name-sub">
                {{account.znc.naAccountInfo.nickname}} ({{account.znc.naAccountInfo.screenName}})
              </span>
            </div>
            <md-button class="md-list-action md-icon-button" @click.stop.prevent="startAccountInfoDialog(account)" @mousedown.stop>
              <md-icon>info</md-icon>
              <md-tooltip>{{$t('PageAccounts.tipShowAccountInfo', [account.name])}}</md-tooltip>
            </md-button>
            <md-button class="md-list-action md-icon-button ld-red" @click.stop.prevent="startRemoveAccountDialog(account)" @mousedown.stop>
              <md-icon>remove</md-icon>
              <md-tooltip>{{$t('PageAccounts.tipRemove', [account.name])}}</md-tooltip>
            </md-button>
          </md-list-item>
        </transition-group>
      </vue-draggable>
      <!-- actions (speed dial) -->
      <md-speed-dial v-show="managingAccounts" class="md-bottom-right">
        <md-speed-dial-target class="md-primary" @click="finishManagingAccounts">
          <md-icon>done</md-icon>
          <md-tooltip md-direction="left">{{$t('PageAccounts.FinishManagingAccounts')}}</md-tooltip>
        </md-speed-dial-target>
        <md-speed-dial-content>
          <md-button class="md-icon-button" @click="addAccount" :disabled="accountLimitReached">
            <md-icon>person_add</md-icon>
          <md-tooltip md-direction="left">
            {{$t('PageAccounts.AddAccount')}}
            <template v-if="accountLimitReached">
              {{$t('PageAccounts.upToSupported', [maxAccounts])}}
            </template>
          </md-tooltip>
          </md-button>
        </md-speed-dial-content>
      </md-speed-dial>
    </template>
    <!-- account limit reached -->
    <div class="account-limit-reached" v-if="accountLimitReached">
      {{$t('PageAccounts.AccountLimitReached')}}
    </div>
    <!-- on no accounts -->
    <md-empty-state
      v-if="!accounts.length"
      v-show="!accounts.length"
      md-icon="people"
      :md-label="$t('PageAccounts.emptyTitle')"
      :md-description="$t('PageAccounts.emptyDescription')"
    >
      <md-button class="md-primary md-raised" @click="addAccount" :disabled="accountLimitReached">Add an account</md-button>
    </md-empty-state>

    <!-- snackbar shown on account added -->
    <md-snackbar class="snackbar-account-added" md-position="left" :md-active.sync="showAccountAddedSnackbar">
      <i18n path="PageAccounts.snackbarAddAccount" tag="span">
        <plate-account class="plate" :account="addedAccount" avatar-class="md-small"/>
      </i18n>
      <md-button class="md-primary" @click="showAccountAddedSnackbar = false">
        {{$t('button.OK')}}
      </md-button>
    </md-snackbar>

    <!-- dialog for adding account by URL -->
    <md-dialog class="dialog-add-account-by-url" :md-fullscreen="false" :md-active.sync="showAddAccountByUrlDialog" @md-closed="finishAddAccountByURLDialog(false)">
      <md-dialog-title>{{$t('PageAccounts.URL')}}</md-dialog-title>
      <md-dialog-content>
        <i18n path="PageAccounts.dialogAddAccountByUrlTitle" tag="div">
          <code>{{protocol}}://</code>
        </i18n>
        <md-field>
          <label>{{$t('PageAccounts.URL')}}</label>
          <md-input type="text" v-model="addAccountCallbackUrl" :placeholder="`${protocol}://`"/>
        </md-field>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button @click="finishAddAccountByURLDialog(false)">
          {{$t('button.Cancel')}}
        </md-button>
        <md-button class="md-primary" @click="finishAddAccountByURLDialog(true)">
          {{$t('button.Add')}}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <!-- dialog for removing account -->
    <md-dialog class="dialog-remove-account" :md-fullscreen="false" :md-active.sync="showRemoveAccountDialog" @md-closed="finishRemoveAccountDialog(false)">
      <md-dialog-title>{{$t('PageAccounts.dialogRemoveAccountTitle')}}</md-dialog-title>
      <md-dialog-content>
        <i18n path="PageAccounts.dialogRemoveAccountText" tag="div">
          <plate-account class="plate" :account="removingAccount" avatar-class="md-small"/>
        </i18n>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="finishRemoveAccountDialog(false)">
          {{$t('button.Cancel')}}
        </md-button>
        <md-button class="ld-red" @click="finishRemoveAccountDialog(true)">
          {{$t('button.Remove')}}
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <dialog-account-info :account="infoDialogAccount" :show.sync="showAccountInfoDialog"/>
  </template>
</base-layout>
</template>


<script>
import VueDraggable from 'vuedraggable';

import {appName, accountPlaceholder} from '../../common/config';
import {clientId} from '../../common/napiConfig';
import * as ipc from '../lib/ipc';

import BaseLayout from './BaseLayout.vue';
import DialogAccountInfo from './DialogAccountInfo.vue';
import PlateAccount from './PlateAccount.vue';
import mixinQuit from './mixinQuit';


export default {
  components: {
    VueDraggable,
    BaseLayout,
    DialogAccountInfo,
    PlateAccount,
  },
  mixins:[
    mixinQuit,
  ],
  data() {
    return {
      maxAccounts: MAX_ACCOUNTS,
      appName,
      protocol: `npf${clientId}`,   // TODO:
      // accountsProxy: a clone of accounts, which is directly mutable (for vue-draggable)
      // setter does not work for this because mutation will be done without a setter
      accountsProxy: [],
      managingAccounts: false,
      draggingAccountId: null,
      showRemoveAccountDialog: false,
      showAccountInfoDialog: false,
      showAddAccountByUrlDialog: false,
      showAccountAddedSnackbar: false,
      addAccountCallbackUrl: '',
      removingAccount: accountPlaceholder,
      infoDialogAccount: accountPlaceholder,
      addedAccount: accountPlaceholder,
      addAccountStatus: {
        pendingCount: 0,
        protocolRegistered: false,
      },
    };
  },
  computed: {
    title$$() {
      return this.$t('PageAccounts.windowTitle', [appName]);
    },
    accounts() {
      return this.$store.state.accounts.accounts;
    },
    accountLimitReached() {
      return MAX_ACCOUNTS && this.accounts.length >= MAX_ACCOUNTS;
    },
    showNaInfo() {
      return this.$store.state.preferences.preferences.showNaInfo;
    },
    draggable() {
      if (this.draggingAccountId == null) {
        // returns true if nothing is being dragged
        return true;
      }
      // returns true if the dragging account exists, false if the dragging account has been removed
      return this.$store.getters.accountExists(this.draggingAccountId);
    },
    removingAccountExists() {
      if (this.removingAccount.$$isPlaceholder) {
        return true;
      }
      return this.$store.getters.accountExists(this.removingAccount.id);
    },
  },
  watch: {
    accountsProxy(curr) {
      // shallow watch will do because content of elements will not change
      this.$store.commit('setAccounts', curr);
    },
    accounts(curr) {
      // shallow watch will do because content of elements will not change
      if (curr.length === 0) {
        this.finishManagingAccounts();
      }
      this.accountsProxy = [...curr];
    },
    removingAccountExists(curr) {
      if (!curr) {
        this.finishRemoveAccountDialog(false);
      }
    },
    addAccountStatus: {
      deep: true,
      handler(curr) {
        if (!curr.pendingCount) {
          this.finishAddAccountByURLDialog(false);
        }
      },
    },
    accountLimitReached(curr) {
      if (curr) {
        this.finishAddAccountByURLDialog(false);
      }
    },
  },
  created() {
    this.$store.dispatch('fetchAccounts');
    ipc.on('accountAdded', account => {
      this.addedAccount = account;
      this.showAccountAddedSnackbar = true;
    });
    ipc.on('showAddAccountByUrl', () => {
      this.startAddAccountByURLDialog();
    });
    ipc.on('addAccountStatus', status => {
      this.addAccountStatus = status;
    });
    ipc.send('getAddAccountStatus');
  },
  methods: {
    openAuthPage() {
      ipc.send('openAuthPage');
    },
    addAccount() {
      this.openAuthPage();
    },
    removeAccount(accountId) {
      this.$store.commit('removeAccount', accountId);
    },
    startAddAccountByURLDialog() {
      this.addAccountCallbackUrl = '';
      this.showAddAccountByUrlDialog = true;
    },
    finishAddAccountByURLDialog(execute = false) {
      if (execute) {
        ipc.send('addAccountByUrl', this.addAccountCallbackUrl);
      }
      this.showAddAccountByUrlDialog = false;
      this.addAccountCallbackUrl = '';
    },
    startRemoveAccountDialog(account) {
      this.removingAccount = account;
      this.showRemoveAccountDialog = true;
    },
    finishRemoveAccountDialog(execute = false) {
      if (execute) {
        this.removeAccount(this.removingAccount.id);
      }
      this.removingAccount = accountPlaceholder;
      this.showRemoveAccountDialog = false;
    },
    startAccountInfoDialog(account) {
      this.infoDialogAccount = account;
      this.showAccountInfoDialog = true;
    },
    finishManagingAccounts() {
      this.managingAccounts = false;
      this.draggingAccountId = null;
    },
    startManagingAccounts() {
      this.managingAccounts = true;
      this.draggingAccountId = null;
    },
  },
};
</script>


<style>
@import url('styleRed.css');
</style>


<style scoped>
@media screen and (max-width: 640px) {
  .accounts {
    /* For the speed dial in the bottom of page */
    margin-bottom: 8rem;
  }
}

.title {
  flex: 1;
}

.menu-text {
  width: 100%;
}

.accounts {
  max-width: 480px;
  margin: auto;
  box-sizing: border-box;
  padding: 0;
}

.account-avatar {
  width: 3.25rem;
  height: 3.25rem;
}

.account-name-sub {
  padding-top: .3rem;
  opacity: .8;
  font-size: .8rem;
}

.accounts:not(.dragging) .account-item:hover:not(.accounts-list-enter-active):not(.accounts-list-leave):not(.accounts-list-leave-active):not(.accounts-list-leave-to) {
  border: solid 1px rgba(0, 0, 0, .175);
}

.account-item {
  box-sizing: border-box;
  border: solid 1px rgba(0, 0, 0, .05);
  margin-top: -1px;
  cursor: pointer;
}

.add-account-button {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
}


/* account managings */

.accounts-managing .account-item {
  cursor: default;
}

.accounts-managing .account-thumb {
  margin-right: 1.5rem;
  cursor: pointer;
}

.accounts-managing .account-avatar {
  margin-right: 1rem;
}

.accounts-managing .account-name {
  user-select: none;
}

.accounts-managing:not(.draggable), .accounts-managing:not(.draggable) .account-item {
  cursor: not-allowed;
}


/* account limit reached */

.account-limit-reached {
  margin-top: 1rem;
  text-align: center;
  font-size: 90%;
}


/* dialogs */

.no-margin {
  margin: 0;
}


/* transitions */

.account-item {
  transition: all 1.3s;
}

.accounts-list-enter, .accounts-list-leave-to {
  opacity: 0;
  transform: translateX(5rem);
}

.accounts-list-enter-active {
  transition: all .9s;
}

.accounts-list-leave-active {
  transition: all .8s;
  height: 0;
  overflow: visible;
}
</style>
