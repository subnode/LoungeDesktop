<template>
  <div class="plate">
    <md-avatar :class="avatarClass">
      <img :src="account.imageUri" @dragstart.prevent>
    </md-avatar>
    <span class="name" :style="unselectableStyle">
      {{account.name}}
    </span>
  </div>
</template>


<script>
export default {
  props: {
    account: {
      type: Object,
      required: true,
    },
    unselectable: {
      type: Boolean,
      default: false,
    },
    avatarClass: {
      type: [String, Array, Object],
      default: '',
    },
  },
  computed: {
    unselectableStyle() {
      return this.unselectable ? 'user-select:none' : '';
    },
  },
};
</script>


<style scoped>
.plate {
  display: inline-block;
}
</style>
