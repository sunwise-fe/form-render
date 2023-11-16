<template>
  <div>
    <!-- 绑定显示，校验匹配规则字段，label，rules校验规则，attrs（原生属性）， -->
    <el-form-item
      v-if="_show"
      :prop="prop"
      :label="typeof data.label === 'string' ? data.label : ''"
      :rules="!readonly && Array.isArray(data.rules) ? data.rules : undefined"
      v-bind="data.attrs"
      class="render-form-item"
    >
      <!-- label插槽 -->
      <template #label>
        <v-node v-if="typeof data.label !== 'string'" :content="data.label" />
      </template>
      <!-- 处理之只读input select -->
      <template v-if="readonly && hasReadonlyContent">
        <el-input
          v-if="data.type === 'input'"
          v-bind="componentProps"
          :modelValue="itemValue"
          readonly
          v-on="listeners"
        />

        <div v-else-if="data.type === 'select'">
          {{ multipleValue }}
        </div>
      </template>
      <!-- 处理 date-picker,cascader,动态渲染不显示文字 bug-->
      <component
        v-else-if="data.type === 'date-picker' || data.type === 'cascader'"
        ref="customComponent"
        v-bind:is="data.component || `el-${data.type || 'input'}`"
        v-bind="componentProps"
        :modelValue="itemValue"
        :disabled="disabled || componentProps.disabled || readonly"
        v-on="listeners"
        :loading="loading"
        :remote-method="
          data.remoteMethod || componentProps.remoteMethod || remoteMethod
        "
      >
      </component>
      <!-- 绑定 模板引用 动态组件 props value值 是否禁用 事件 lodding 远端搜索方法 -->
      <component
        v-else
        ref="customComponent"
        v-bind:is="data.component || `el-${data.type || 'input'}`"
        v-bind="componentProps"
        :modelValue="itemValue"
        :disabled="disabled || componentProps.disabled || readonly"
        v-on="listeners"
        :loading="loading"
        :remote-method="
          data.remoteMethod || componentProps.remoteMethod || remoteMethod
        "
      >
        <!-- 插槽处理  选项-->
        <template v-for="(opt, index) in options">
          <el-option
            v-if="data.type === 'select'"
            :key="optionKey(opt) || index"
            v-bind="opt"
          />
          <el-checkbox-button
            v-if="data.type === 'checkbox-group' && data.style === 'button'"
            :key="opt.value"
            v-bind="opt"
            :label="'value' in opt ? opt.value : opt.label"
          >
            {{ opt.label }}
          </el-checkbox-button>
          <el-checkbox
            v-else-if="
              data.type === 'checkbox-group' && data.style !== 'button'
            "
            :key="opt.value"
            v-bind="opt"
            :label="'value' in opt ? opt.value : opt.label"
          >
            {{ opt.label }}
          </el-checkbox>
          <el-radio-button
            v-else-if="data.type === 'radio-group' && data.style === 'button'"
            :key="opt.label"
            v-bind="opt"
            :label="'value' in opt ? opt.value : opt.label"
            >{{ opt.label }}</el-radio-button
          >
          <el-radio
            v-else-if="data.type === 'radio-group' && data.style !== 'button'"
            :key="opt.label"
            v-bind="opt"
            :label="'value' in opt ? opt.value : opt.label"
            >{{ opt.label }}</el-radio
          >
        </template>
      </component>
    </el-form-item>
  </div>
</template>

<script setup>
import { computed, reactive, inject, nextTick, ref, watch } from "vue";
import { noop } from "../util/utils";
import getEnableWhenStatus from "../util/enable-when";
import _includes from "lodash.includes";
import _topairs from "lodash.topairs";
import _frompairs from "lodash.frompairs";
import _get from "lodash.get";
// 改用 动态组件 方便获取 ref
// import CustomComponent from "../util/CustomComponent";
import VNode from "../util/VNode";
import axios from "axios";
let customComponent = ref();

let props = defineProps({
  data: Object,
  prop: {
    type: String,
    default(rawProps) {
      return rawProps.data.id;
    },
  },

  itemValue: {},
  value: Object,
  disabled: Boolean,
  readonly: Boolean,
  options: Array,
});

// 更新表单方法
const emit = defineEmits(["updateValue"]);
let propsInner = reactive({});

const loading = ref(false);

let dataRef = ref(props.data);
// 注入一个由祖先组件或整个应用 (通过 app.provide()) 提供的值。
// 父组件提供 element ui的方法
let methods = inject("methods");
//  父组件提供的 更新 options的方法
let setOptions = inject("setOptions");
// 是否校验
const isBlurTrigger =
  props.data.rules &&
  props.data.rules.some((rule) => {
    return rule.required && rule.trigger === "blur";
  });

// 计算props
const componentProps = computed(() => ({ ...props.data.el, ...propsInner }));
// 计算是否为只读 input select
const hasReadonlyContent = computed(() =>
  ["input", "select"].includes(props.data.type)
);
//执行传入的hidden
const hiddenStatus = computed(() => {
  const hidden = props.data.hidden || (() => false);
  return hidden(props.value, props.data);
});
// 弃用
const enableWhenStatus = computed(() =>
  getEnableWhenStatus(props.data.enableWhen, props.data.value)
);
// 处理组件的显示与隐藏
const _show = computed(() => !hiddenStatus.value && enableWhenStatus.value);
// 处理事件监听 vue3实现 v-model  props：modelValue   event：update:modelValue
const listeners = computed(() => {
  const data = props.data;
  const id = data.id;
  const atChange = data.atChange || noop;
  const on = data.on || {};
  const originOnInput = on.input || noop;
  const originOnChange = on.change || noop;
  const trim = data.trim !== undefined ? data.trim : true;

  let updateForm = inject("updateForm");
  return {
    ..._frompairs(
      _topairs(on).map(([eName, handler]) => [
        eName,
        (...args) => handler(args, updateForm),
      ])
    ),
    // 手动更新表单数据
    "update:modelValue": (value, ...rest) => {
      if (typeof value === "string" && trim) value = value.trim();
      emit("updateValue", { id, value });
      // FIXME: rules 的 trigger 只写了 blur，依然会在 change 的时候触发校验！
      triggerValidate(id);
    },
  };
});
// el-select 显示对应的 label；（只读）
const multipleValue = computed(() => {
  const multipleSelectValue =
    _get(props.data, "el.multiple") && Array.isArray(props.itemValue)
      ? props.itemValue
      : [props.itemValue];
  return multipleSelectValue
    .map((val) => (props.options.find((op) => op.value === val) || {}).label)
    .join();
});
// 处理服务器获取 options
const makingRequest = (remoteConfig, query) => {
  const isOptionsCase =
    ["select", "checkbox-group", "radio-group"].indexOf(props.data.type) > -1;
  const {
    request, //request：用于发起远程请求的函数
    prop = "options", // 处理响应数据时的属性名称，默认为 "options" 默认处理 el-cascader 的情况
    dataPath = "", //用于指定响应数据中的路径，默认为空字符串
    onResponse = (resp) => {
      //响应成功时的回调函数，默认为一个函数，用于处理响应数据。
      if (dataPath) resp = _get(resp, dataPath);
      if (isOptionsCase) {
        return resp?.map((item) => ({
          label: item[label],
          value: item[value],
        }));
      } else {
        return resp;
      }
    },
    onError = (error) => {
      //发生错误时的回调函数，默认为一个函数，用于打印错误信息并将 loading.value 设置为 false
      console.error(error.message);
      loading.value = false;
    },
    label = "label", //用于选项中的标签属性，默认为 "label"。
    value = "value", //用于选项中的值属性，默认为 "value"
  } = remoteConfig;
  //，表示开始加载数据。
  loading.value = true;
  //Promise.resolve(request(query))：这里使用 Promise.resolve 包装了 request(query)，以确保始终返回一个 Promise 对象。
  Promise.resolve(request(query))
    // 当请求成功时执行 onResponse 函数，当请求失败时执行 onError 函数。
    .then(onResponse, onError)
    // .then((resp) => { ... })：在请求完成后，无论成功或失败，都会执行这个 .then 块。在这里，根据 isOptionsCase 的值，对响应数据 resp 进行不同的处理。
    .then((resp) => {
      // 如果 isOptionsCase 为 true，则将响应数据中的每个元素映射为包含 "label" 和 "value" 属性的对象，并将结果传递给 setOptions 函数（如果存在）。
      if (isOptionsCase) {
        setOptions && setOptions(props.prop, resp);
      } else {
        // 如果 isOptionsCase 为 false，则将响应数据存储在 propsInner 中，属性名为 prop。
        propsInner = Object.assign(propsInner, { [prop]: resp });
      }
      // ，表示加载完成。
      loading.value = false;
    });
};
// 监听 是否有 data
watch(dataRef, (data) => {
  if (!data) {
    throw new Error("data must be an Object.");
  } else if (!data.id) {
    throw new Error("`id` is unvalidated.");
  } else if (!data.type && !data.component) {
    throw new Error("`type` and `component` cannot both be null.");
  }
});
// 处理服务器获取options
watch(
  /**
   * 这里其实用 remote 处理了两件事。有机会是可以拆分的
   * 1. 基本用法，配置 url 后即可从远程获取某个 prop 注入到组件
   * 2. 针对 select、checkbox-group & radio-group 组件，会直接将 resp 作为 options 处理；label & value 也是直接为这个场景而生的
   */
  () => props.data.remote?.request,
  (newValue, oldValue) => {
    // 不应该用 watch data.remote，因为对象引用是同一个 https://cn.vuejs.org/v2/api/#vm-watch (估计当初这样写是为了方便)
    // 现改写成：分开处理 remote.request，remote.url
    // 至于为什么判断新旧值相同则返回，是因为 form 的 content 是响应式的，防止用户直接修改 content 其他内容时，导致 remote.request 重新发请求

    if (!newValue || typeof newValue !== "function" || newValue === oldValue)
      return;

    makingRequest(props.data.remote);
  },
  { immediate: true }
);
// 处理服务器获取options
watch(
  () => props.data.remote?.url,
  (url, oldV) => {
    // 第三个判断条件：防止 url 与 request 同时存在时，发送两次请求
    if (!url || url === oldV || (!oldV && props.data.remote.request)) return;
    const request =
      props.data.remote.request ||
      (() => axios.get(url).then((resp) => resp.data));
    makingRequest(Object.assign({}, props.data.remote, { request }));
  },
  { immediate: true }
);

// 校验表单项目
const triggerValidate = async (id) => {
  try {
    if (!props.data.rules || !props.data.rules.length) return;
    if (isBlurTrigger) return;
    await nextTick();

    (await methods) && methods.validateField(id);
  } catch (error) {
    console.log(error);
  }
};
// 远端搜索方法
const remoteMethod = (query) => {
  if (
    _get(props.data, "type") === "select" &&
    _get(props.data, "el.filterable") &&
    _get(props.data, "el.remote")
  ) {
    makingRequest(props.data.remote, query);
  }
};
// 初始化 optios key
const optionKey = (opt) => {
  if (opt.value instanceof Object) {
    if (!props.data.el || !props.data.el.valueKey) {
      return;
    }

    return opt.value[props.data.el.valueKey];
  } else {
    return opt.value;
  }
};
// 暴露 element ui 模版引用
defineExpose({ customComponent });
</script>
