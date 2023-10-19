<template>
  <div>
    <el-form-renderer inline :content="content" ref="form"> </el-form-renderer>
    <el-button @click="getComponent('id')">获取id input</el-button>
    <el-button @click="getComponent('first')">获取first name input</el-button>
  </div>
</template>
<script setup>
import { reactive, ref } from "vue";
import elFormRenderer from "../components/femessage/el-form-renderer.vue";

const form = ref();
const content = reactive([
  {
    id: "id",
    type: "input",
    label: "id",
    el: {
      placeholder: "id",
    },
  },
  {
    type: "group",
    label: "name",
    id: "name",
    items: [
      {
        id: "first",
        label: "first name",
        type: "input",
      },
      {
        id: "last",
        label: "last name",
        type: "input",
      },
    ],
  },
]);
const getComponent = (id) => {
  console.log(form.value.getComponentById(id));
};
</script>
<style scoped>
.box {
  margin: 20px 0;
  font-size: 20px;
}
</style>
