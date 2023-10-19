<template>
  <div class="box">slot-label</div>
  <el-form-renderer label-width="100px" :content="content" inline />
</template>
<script setup>
import { reactive, h, resolveComponent } from "vue";
import elFormRenderer from "../components/femessage/el-form-renderer.vue";
const content = reactive([
  {
    type: "input",
    id: "name",
    label: h("span", {}, "输入"),
    el: {
      size: "small",
    },
  },
]);
</script>
<style scoped>
.box {
  margin: 20px 0;
  font-size: 20px;
}
</style>
