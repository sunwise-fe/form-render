<template>
  <div class="box">update-form</div>
  <div>默认情况下，updateForm 来者不拒，不在表单设置内的值，也可以存储进去</div>
  <div class="update-form">
    <el-form-renderer :content="content" inline ref="formRender">
      <el-button @click="setValue">updateForm()</el-button>
      <div>
        <el-button type="primary" @click="getValue(false)"
          >log getFormValue()</el-button
        >
        <el-button type="primary" @click="getValue(true)"
          >log getFormValue({strict: true})</el-button
        >
      </div>
    </el-form-renderer>
    <div>{{ value }}</div>
  </div>
</template>
<script setup>
import { reactive, ref } from "vue";
import elFormRenderer from "../components/femessage/el-form-renderer.vue";
let formRender = ref();
let value = ref();
const content = reactive([
  {
    id: "name",
    type: "input",
    label: "name",
    el: {
      placeholder: "name",
    },
  },
  {
    id: "area",
    type: "select",
    label: "area",
    el: {
      placeholder: "area",
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
const getValue = (strict) => {
  let res = formRender.value.getFormValue({ strict });
  value.value = res;
};
const setValue = () => {
  formRender.value.updateForm({
    name: "alvin",
    area: "shanghai",
    // 设置冗余字段
    extraKey: "extraValue",
  });
};
</script>
<style scoped>
.box {
  margin: 20px 0;
  font-size: 20px;
}
</style>
