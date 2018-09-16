<template>
<div>
  <md-dialog class="dialog-account-info" :md-fullscreen="false" :md-active.sync="showProxy">
    <md-dialog-title>{{$t('DialogAccountInfo.title')}}</md-dialog-title>
    <md-dialog-content>
      <md-list class="md-double-line">
        <md-list-item>
          <md-avatar>
            <img :src="account.imageUri" @dragstart.prevent>
          </md-avatar>
          <div class="md-list-item-text">
            <span>{{account.name}}</span>
            <span class="secondrow">{{account.id}}</span>
          </div>
        </md-list-item>
        <md-divider/>
        <!-- divider -->
        <md-subheader class="subheader md-primary">
          {{$t('DialogAccountInfo.headerCna')}}
        </md-subheader>
        <md-list-item>
          <div class="md-list-item-text">
            <span>{{account.znc.naAccountInfo.nickname}} ({{account.znc.naAccountInfo.screenName}})</span>
            <span class="secondrow">{{account.znc.naAccountInfo.id}}</span>
          </div>
        </md-list-item>
      </md-list>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showProxy = false">{{$t('button.OK')}}</md-button>
    </md-dialog-actions>
  </md-dialog>
</div>
</template>


<script>
export default {
  props: {
    account: {
      type: Object,
      required: true,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    showProxy: {
      get() {
        return this.show;
      },
      set(value) {
        this.$emit('update:show', value);
      },
    },
  },
};
</script>


<style scoped>
.secondrow {
  opacity: .8;
  font-size: .8rem !important;
}

.subheader {
  align-items: flex-end;
}
</style>
