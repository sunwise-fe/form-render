<template>
  <div>
    <el-form
      ref="myelForm"
      v-bind="$attrs"
      :model="value"
      class="el-form-renderer"
    >
      <template v-for="item in innerContent" :key="item.id">
        <slot :name="`id:${item.id}`" />
        <slot :name="`$id:${item.id}`" />

        <component
          :is="item.type === GROUP ? RenderFormGroup : RenderFormItem"
          :ref="
            (el) => {
              customComponent[item.id] = el;
            }
          "
          :data="item"
          :value="value"
          :item-value="value[item.id]"
          :disabled="
            disabled ||
            (typeof item.disabled === 'function'
              ? item.disabled(value)
              : item.disabled)
          "
          :readonly="readonly || item.readonly"
          :options="options[item.id]"
          @updateValue="updateValue"
        />
      </template>
      <slot />
    </el-form>
  </div>
</template>

<script setup>
import RenderFormGroup from "./components/render-form-group.vue";
import RenderFormItem from "./components/render-form-item.vue";
import {
  reactive,
  computed,
  ref,
  watch,
  onMounted,
  nextTick,
  provide,
  getCurrentInstance,
} from "vue";
import transformContent from "./util/transform-content";
import _set from "lodash.set";
import _isequal from "lodash.isequal";
import _clonedeep from "lodash.clonedeep";
import {
  collect,
  mergeValue,
  transformOutputValue,
  transformInputValue,
  correctValue,
} from "./util/utils";
let GROUP = "group";
/**
 * inputFormat 让整个输入机制复杂了很多。value 有以下输入路径:
 * 1. 传入的 form => inputFormat 处理
 * 2. updateForm => inputFormat 处理
 * 3. 但 content 中的 default 没法经过 inputFormat 处理，因为 inputFormat 要接受整个 value 作为参数
 * 4. 组件内部更新 value，不需要走 inputFormat
 */
let value = reactive({}); // 表单数据对象
let options = reactive({});
let initValue = reactive({});
let myelForm = ref();
let methods = {};
const customComponent = ref([]);
let emit = defineEmits(["update:FormData"]);
// 注入 element ui form 方法
/**
 * 与 element 相同，在 mounted 阶段存储 initValue
 * @see https://github.com/ElemeFE/element/blob/6ec5f8e900ff698cf30e9479d692784af836a108/packages/form/src/form-item.vue#L304
 */
onMounted(async () => {
  initValue = _clonedeep(value);
  await nextTick();
  // 检查 myelForm 是否已经初始化
  if (myelForm && myelForm.value) {
    Object.keys(myelForm.value).forEach((item) => {
      // 检查属性是否存在于 methods 对象中
      if (myelForm.value[item] && !(item in methods)) {
        methods[item] = myelForm.value[item];
      }
    });
  }
  /**
   * 有些组件会 created 阶段更新初始值为合法值，这会触发 validate。目前已知的情况有：
   * - el-select 开启 multiple 时，会更新初始值 undefined 为 []
   * @hack
   */
  methods.clearValidate();
});

let props = defineProps({
  //表单项
  content: {
    type: Array,
    required: true,
  },
  // 禁用
  disabled: {
    type: [Boolean, Function],
    default: false,
  },
  //只读
  readonly: {
    type: Boolean,
    default: false,
  },
  /**
   * v-model 的值。传入后会优先使用
   */
  FormData: {
    type: Object,
    default: undefined,
  },
});
//兼容处理
let innerContent = computed(() => transformContent(props.content));
// 初始化默认值
let setValueFromModel = () => {
  if (innerContent.length) return;
  /**
   * 没使用 v-model 时才从 default 采集数据
   * default 值没法考虑 inputFormat
   * 参考 value-format.md 的案例。那种情况下，default 该传什么？
   */
  let newValue = props.FormData
    ? transformInputValue(props.FormData, innerContent.value)
    : collect(innerContent.value, "default");
  correctValue(newValue, innerContent.value);
  if (!_isequal(value, newValue)) value = Object.assign(value, newValue);
};
// v-model初始化默认数据
watch(
  () => props.FormData,
  (newForm) => {
    if (!newForm) return;
    setValueFromModel();
  },
  { immediate: true, deep: true }
);
// 初始化默认数据
watch(
  innerContent,
  (newContent) => {
    try {
      if (!newContent) return;

      // 如果 content 没有变动 remote 的部分，这里需要保留之前 remote 注入的 options
      Object.assign(options, collect(newContent, "options"));
      setValueFromModel();
    } catch (error) {
      console.log(error);
    }
  },
  { immediate: true }
);

// v-model 传递值
watch(value, (newValue, oldValue) => {
  try {
    if (!newValue) return;
    if (props.FormData) {
      let data = Object.assign(
        props.FormData,
        transformOutputValue(newValue, innerContent)
      );
      emit("update:FormData", data);
    }
  } catch (error) {
    console.log(error, "-----");
  }
  // deep: true, // updateValue 是全量更新，所以不用
});

/**
 * 更新表单数据
 * @param  {String} options.id 表单ID
 * @param  {All} options.value 表单数据
 */
let updateValue = ({ id, value: v }) => {
  value[id] = v;
};
/**
 * 重置表单为初始值
 *
 * @public
 */
let resetFields = async () => {
  /**
   * 之所以不用 el-form 的 resetFields 机制，有以下原因：
   * - el-form 的 resetFields 无视 el-form-renderer 的自定义组件
   * - el-form 的 resetFields 不会触发 input & change 事件，无法监听
   * - bug1: https://github.com/FEMessage/el-data-table/issues/176#issuecomment-587280825
   * - bug2:
   *   0. 建议先在监听器 watch.value 里 console.log(v.name, oldV.name)
   *   1. 打开 basic 示例
   *   2. 在 label 为 name 的输入框里输入 1，此时 log：'1' ''
   *   3. 点击 reset 按钮，此时 log 两条数据： '1' '1', '' ''
   *   4. 因为 _isequal(v, oldV)，所以没有触发 v-model 更新
   */
  value = _clonedeep(initValue);
  await nextTick();
  methods.clearValidate();
};
/**
 * 当 strict 为 true 时，只返回设置的表单项的值, 过滤掉冗余字段, 更多请看 update-form 示例
 * @param {{strict: Boolean}} 默认 false
 * @return {object} key is item's id, value is item's value
 * @public
 */
let getFormValue = ({ strict = false } = {}) => {
  return transformOutputValue(value, innerContent, { strict });
};
/**
 * update form values
 * @param {object} newValue - key is item's id, value is the new value
 * @public
 */
let updateForm = (newValue) => {
  newValue = transformInputValue(newValue, innerContent);
  mergeValue(value, newValue, innerContent);
};
/**
 * update select options
 * @param {string} id<br>
 * @param {array} options
 * @public
 */
let setOptions = (id, O) => {
  _set(options, id, O);
  options = Object.assign(options); // 设置之前不存在的 options 时需要重新设置响应式更新
};

/**
 * get custom component
 * @param {string} id<br>
 * @public
 */
const getComponentById = (id) => {
  let content = [];
  props.content.forEach((item) => {
    if (item.type === GROUP) {
      const items = item.items.map((formItem) => {
        formItem.groupId = item.id;
        return formItem;
      });
      content.push(...items);
    } else {
      content.push(item);
    }
  });
  const itemContent = content.find((item) => item.id === id);
  if (!itemContent) {
    return undefined;
  }
  if (!itemContent.groupId) {
    return customComponent.value[id].customComponent;
  } else {
    const componentRef =
      customComponent.value[itemContent.groupId].customComponent;
    return componentRef[`formItem-${id}`].customComponent;
  }
};
provide("methods", methods);
provide("updateForm", updateForm);
provide("setOptions", setOptions);
defineExpose({
  updateValue,
  resetFields,
  getFormValue,
  updateForm,
  setOptions,
  methods,
  getComponentById,
});
</script>
<script>
export default {
  name: "ElFormRenderer",
};
</script>
