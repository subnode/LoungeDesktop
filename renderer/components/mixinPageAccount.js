import mixinError from './mixinError';
import mixinForceRoute from './mixinForceRoute';


export default {
  mixins: [
    mixinError,
    mixinForceRoute,
  ],
  data() {
    return {
      // used for reference to a removed account
      $_accountCache: null,
    };
  },
  computed: {
    /**
     * returns true if account exists
     * this implies that the account list must be fetched in advance, or this returns false
     */
    $_accountExists() {
      return this.$store.getters.accountExists(this.accountId);
    },
    /**
     * returns true if list of accounts is fetched and account does not exist
     */
    $_accountInexistent() {
      return this.$store.getters.isAccountsFetched && !this.$_accountExists;
    },
    accountId() {
      return parseInt(this.$route.params.accountId, 10);
    },
    account() {
      return this.$store.getters.getAccountById(this.accountId);
    },
  },
  watch: {
    account(curr, prev) {
      this.$_updateAccountCache();
      if (curr.$$isPlaceholder && !prev.$$isPlaceholder && prev.id === this.accountId) {
        this.setError('accountRemoved', this.$_accountCache, true);
        this.forceRoute('/', false);    // because account remove message is already shown in the /accounts page.
        return;
      }
    },
    $_accountInexistent() {
      this.$_checkAccountInexistent();
    },
  },
  created() {
    this.$store.dispatch('fetchAccounts');
    this.$_updateAccountCache();
    this.$_checkAccountInexistent();
  },
  methods: {
    $_updateAccountCache() {
      if (this.$_accountExists) {
        this.$_accountCache = this.account;
      }
    },
    $_checkAccountInexistent() {
      if (this.$_accountInexistent) {
        // go to the home page if account does not exist
        this.setError('accountInexistent', this.accountId, true);
        this.forceRoute('/', true);
        return;
      }
    },
  },
};
