<template>
  <el-input v-model="newValue" v-bind="$attrs"></el-input>
</template>

<script setup>
import { watch, computed, useAttrs } from "vue";

let emit = defineEmits(["customEvent", "update:modelValue"]);

let props = defineProps({
  modelValue: String,
  title: String,
});

const attrs = useAttrs();
console.log(attrs);

watch(
  () => props.modelValue,
  () => {
    console.log("触发");
    emit("customEvent", newValue.value);
  }
);

// 计算属性求和
const newValue = computed({
  get: () => {
    console.log("get");
    return props.modelValue;
  },
  set: (value) => {
    console.log("set");
    return emit("update:modelValue", value);
  },
});
</script>

<script>
export default {
  // 校验规则
  // rules: [
  //   {
  //     required: true,
  //     message: "自定义组件的提醒消息",
  //   },
  // ],

  // rules 也可以是个函数, 参数是当前表单项配置, 需要返回一个数组.
  rules(item) {
    console.log(item);
    return [
      {
        required: true,
        message: `${item.id} 不能为空`,
      },
    ];
  },
};
</script>
