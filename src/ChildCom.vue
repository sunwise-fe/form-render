<template>
  <div>
    <button class="btn" @click="onClick" v-bind="$attrs">click me</button>
    <br />
    <span>Fallthrough attribute: {{ $attrs }}</span>
  </div>
</template>

<script setup>
import { useAttrs } from "vue";
defineOptions({
  inheritAttrs: false,
});
defineProps({
  msg: {
    type: String,
  },
});
const attrs = useAttrs();
console.log(attrs);
const onClick = () => {
  console.log("子组件");
};
</script>
