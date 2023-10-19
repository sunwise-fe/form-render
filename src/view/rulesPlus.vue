<template>
  <el-form-renderer
    label-width="100px"
    :content="content"
    ref="form"
    :rules="rules"
  >
  </el-form-renderer>
</template>
<script setup>
import { reactive } from "vue";
import elFormRenderer from "../components/femessage/el-form-renderer.vue";
const rule = [
  { required: true, message: "请输入活动名称", trigger: "change" },
  { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "change" },
];
const rules = reactive({ name: [...rule] });
const content = reactive([
  {
    type: "input",
    id: "name",
    label: "name",
  },
  {
    type: "input",
    id: "desc",
    label: "desc",
    rules: [...rule],
  },
]);
</script>
<style scoped>
.box {
  margin: 20px 0;
  font-size: 20px;
}
</style>
