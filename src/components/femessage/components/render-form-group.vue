<template>
  <div>
    <template v-for="(item, index) in data.items" :key="index">
      <slot :name="`id:${item.id}`" />
      <slot :name="`$id:${item.id}`" />

      <render-form-item
        :ref="
          (el) => {
            customComponent[`formItem-${item.id}`] = el;
          }
        "
        :prop="`${data.id}.${item.id}`"
        :data="item"
        :value="value"
        :item-value="itemValue[item.id]"
        :disabled="disabled"
        :readonly="readonly"
        :options="options[item.id]"
        @updateValue="updateValue"
      />
    </template>
  </div>
</template>
<script setup>
import RenderFormItem from "./render-form-item.vue";
const emit = defineEmits(["updateValue"]);
import { ref } from "vue";
let props = defineProps({
  data: Object,
  itemValue: {},
  value: Object,
  disabled: Boolean,
  readonly: Boolean,
  options: Object,
});
let customComponent = ref([]);
const updateValue = ({ id, value }) => {
  emit("updateValue", {
    id: props.data.id,
    value: {
      ...props.itemValue,
      [id]: value,
    },
  });
};
defineExpose({ customComponent });
</script>
