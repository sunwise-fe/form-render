<!-- 父组件 ParentCom.vue -->
<template>
  <ChildCom class="large" @click="onClick" />
</template>

<script setup>
import ChildCom from "../ChildCom.vue";
const onClick = () => {
  console.log("父组件");
};
</script>
<style scoped>
.large {
  color: red;
  font-size: 32px;
}
</style>
