<template>
  <div class="box">next</div>

  <el-button type="primary" @click="openDialogWithData"
    >点击打开 Dialog（带数据）</el-button
  >
  <el-button type="primary" @click="dialogVisible = true"
    >点击打开 Dialog</el-button
  >

  <el-dialog
    v-model="dialogVisible"
    title="Next Tick"
    @open="handleOpen"
    ref="dialog"
    @close="onClose"
  >
    <el-form-renderer :content="content" inline ref="formRender" />
  </el-dialog>
</template>
<script setup>
import { reactive, ref, nextTick } from "vue";
import elFormRenderer from "../components/femessage/el-form-renderer.vue";
let dialogVisible = ref(false);
const dialog = ref();
const formRender = ref();
const content = reactive([
  {
    id: "name",
    type: "input",
    label: "姓名",
    el: {
      placeholder: "请输入",
    },
  },
]);
const handleOpen = async () => {
  console.log(formRender.value);
  formRender.value.updateForm({
    name: "小明",
  });
};
const openDialogWithData = async () => {
  // Dialog 的内容是懒渲染的，即在第一次被打开之前，
  //传入的默认 slot 不会被渲染到 DOM 上，所以需要使用 nextTick 等待 DOM 更新之后才能调用方法
  dialogVisible.value = true;
  await nextTick();
  formRender.value.updateForm({
    name: "小明",
  });
};
const onClose = () => {
  formRender.value.resetFields();
};
</script>
<style scoped>
.box {
  margin: 20px 0;
  font-size: 20px;
}
</style>
