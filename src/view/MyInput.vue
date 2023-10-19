<template>
  <el-form-renderer :content="content" />
</template>
<script setup>
import { reactive, markRaw } from "vue";
import elFormRenderer from "../components/femessage/el-form-renderer.vue";

import MyInput from "../your-component.vue";
const content = reactive([
  {
    component: markRaw(MyInput),
    id: "myInput",
    label: "label",
    // 传入组件属性
    el: {
      placeholder: "请输入一个 title",
      type: "input", // submit button
      title: "这是一个标题", // custom defined props
    },
    // 可以通过 overrideRules: true 来覆盖自定义组件内置的校验规则
    overrideRules: true,
    rules: [
      {
        required: true,
        trigger: "blur",
        message: "不能为空！",
      },
    ],
    // 传入组件事件
    on: {
      focus: ([event], updateForm) => {
        console.log(event.target.value); // output: input value
      },
      customEvent: ([value, msg], updateForm) => {
        console.log(value, msg); // output: 'message'
      },
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
