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
    el: {
      size: "small",
    },
    label: h("div", null, [
      h("span", null, "编辑"),
      h(
        resolveComponent("el-icon"),
        { class: "el-icon--right", size: 20 },
        () => [h(resolveComponent("Edit"))]
      ),
    ]),
  },
]);
</script>
<style scoped>
.box {
  margin: 20px 0;
  font-size: 20px;
}
</style>
