<template>
  <el-form-renderer :content="content" :rules="rules" />
</template>
<script setup>
import { reactive } from "vue";
import elFormRenderer from "../components/femessage/el-form-renderer.vue";
let rule = [
  { required: true, message: "using form rules", trigger: "change" },
  { min: 3, max: 5, message: "3 <= length <= 5", trigger: "change" },
];
const rules = reactive({ desc: [...rule] });
const content = reactive([
  {
    id: "name",
    type: "input",
    label: "name",
    el: {
      placeholder: "name",
    },
    rules: [
      {
        required: true,
        message: "using form-item rules",
        trigger: "change",
      },
    ],
  },
  {
    type: "input",
    id: "desc",
    label: "desc",
  },
  {
    type: "input",
    id: "money",
    label: "money",
    rules: [
      {
        required: true,
        validator: (rule, value, callback) =>
          value >= 0.01
            ? callback()
            : callback(new Error("最小充值金额为0.01元")),
      },
    ],
  },
]);
</script>
<style scoped>
.box {
  margin: 20px 0;
  font-size: 20px;
}
</style>
