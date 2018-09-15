// NODE: define `title$$` on data or computed of every component which wants to modify title


export default {
  watch: {
    title$$() {
      this.$_updateTitle();
    },
  },
  mounted() {
    this.$_updateTitle();
  },
  methods: {
    $_updateTitle() {
      if (this.title$$ != null) {
        document.title = this.title$$;
      }
    },
  },
};
