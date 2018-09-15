import mixinError from './mixinError';
import mixinPageAccount from './mixinPageAccount';
import {appPlaceholder} from '../../common/config';


export default {
  mixins: [
    mixinError,
    mixinPageAccount,
  ],
  computed: {
    /**
     * returns true if list of apps is fetched and app does not exist
     */
    $_appInexistent() {
      return !this.account.$$isPlaceholder && this.account.$$appsFetched && this.app.$$isPlaceholder;
    },
    appId() {
      return parseInt(this.$route.params.appId, 10);
    },
    app() {
      if (this.account.$$isPlaceholder) {
        return appPlaceholder;
      }
      return this.account.$$apps.find(app => app.id === this.appId) || appPlaceholder;
    },
  },
  watch: {
    $_appInexistent() {
      this.$_checkAppInexistent();
    },
  },
  created() {
    this.$store.dispatch('fetchAccountApps', this.accountId);
    this.$_checkAppInexistent();
  },
  methods: {
    $_checkAppInexistent() {
      if (this.$_appInexistent) {
        // go to the home page if account does not exist
        this.setError('appInexistent', {
          account: this.account,
          appId: this.appId,
        }, true);
        this.forceRoute('/', true);
        return;
      }
    },
  },
};
