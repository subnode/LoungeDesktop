<template>
  <div class="account-container">
    <div class="account">
      <img class="account-profile" :src="account.imageUri" @dragstart.prevent>
      <span class="account-name">{{account.name}}</span>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    account: {
      type: Object,
      required: true,
    },
  },
};
</script>


<style scoped>
.account-container {
  display: flex;
  cursor: default;
  align-items: center;
  justify-content: center;
  justify-items: center;
  user-select: none;
  height: 40px;
  margin-right: .5rem;
}

.account {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.account-profile {
  flex: 0 0 auto;
  user-select: none;
  border-radius: 100%;
  height: 36px;
  background-color: rgba(255, 255, 255, .95);
}

.account-name {
  flex: 1 1 auto;
  padding-left: .5em;
  text-transform: none;
  font-weight: 500;
  line-height: normal;
}
</style>
