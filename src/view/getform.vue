<template>
  <el-form-renderer inline :content="content" ref="form">
    <el-form-item>
      <el-button type="primary" @click="printValue">print</el-button>
      <el-button @click="data = {}">reset</el-button>
    </el-form-item>
  </el-form-renderer>
  <div>{{ data }}</div>
</template>
<script setup>
import { reactive, ref } from "vue";
import elFormRenderer from "../components/femessage/el-form-renderer.vue";
const data = ref({});
const form = ref();
const content = reactive([
  {
    id: "name",
    type: "input",
    label: "name",
    default: "alvin",
    el: {
      placeholder: "input sth",
    },
  },
  {
    id: "area",
    type: "select",
    label: "select",
    el: {
      placeholder: "select stn",
    },
    options: [
      {
        label: "shanghai",
        value: "shanghai",
      },
      {
        label: "beijing",
        value: "beijing",
      },
    ],
  },
]);
const printValue = () => {
  data.value = form.value.getFormValue();
};
</script>
<style scoped>
.box {
  margin: 20px 0;
  font-size: 20px;
}
</style>
