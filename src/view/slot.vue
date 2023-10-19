<template>
  <div class="box">slot</div>

  <el-form-renderer :content="content">
    <template v-slot:id:age>
      <button type="button">a button insert before age</button>
    </template>

    <template #default>
      <div style="color: #2a7">default slot is at the bottom</div>
    </template>
  </el-form-renderer>
</template>
<script setup>
import { reactive } from "vue";
import elFormRenderer from "../components/femessage/el-form-renderer.vue";
const content = reactive([
  {
    id: "name",
    label: "name",
    type: "input",
  },
  {
    id: "age",
    label: "age",
    type: "input",
  },
]);
</script>
<style scoped>
.box {
  margin: 20px 0;
  font-size: 20px;
}
</style>
