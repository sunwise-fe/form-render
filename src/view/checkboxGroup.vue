<template>
  <div class="box">checkboxGroup</div>

  <el-form-renderer label-width="100px" :content="content" ref="ruleForm">
  </el-form-renderer>
</template>
<script setup>
import { reactive } from "vue";
import elFormRenderer from "../components/femessage/el-form-renderer.vue";
const content = reactive([
  {
    id: "city",
    type: "checkbox-group",
    /**
     * sytle 属性是为了满足 el-checkbox-button属性而设置,如果不需要使用el-radio-button这可不设置
     */
    style: "button",
    label: "city",
    /**
     * 默认值
     * 没使用 v-model 时从 default 采集数据
     */
    default: ["new york"],
    options: [
      { label: "new york" },
      { label: "guangzhou" },
      { label: "tokyo" },
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
