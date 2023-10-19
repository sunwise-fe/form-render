import _isplainobject from "lodash.isplainobject";
// var pairs = [
//   ["a", 1],
//   ["b", 2],
//   ["c", 3],
// ];==》{ 'a': 1, 'b': 2, 'c': 3 }
import _frompairs from "lodash.frompairs";
// collect 函数接受两个参数，content 和 key，其中 content 是一个包含嵌套数据的数组，key 是要收集的键的名称。（key：options| defult）
export function collect(content, key) {
  return _frompairs(
    content

      // 使用 map 函数对 content 数组进行映射操作。对每个数组中的元素（item）进行处理，创建一个新的对象，该对象包含三个属性：
      .map((item) => ({
        id: item.id,
        type: item.type,
        value: item.type === "group" ? collect(item.items, key) : item[key],
      }))
      //  函数对上一步生成的对象数组进行过滤。只保留那些满足以下条件的对象：（带有optios数据的）
      .filter(
        ({ type, value }) =>
          value !== undefined || (type === "group" && Object.keys(value).length)
      )
      // 返回 [select（id），optons]
      .map(({ id, value }) => [id, value])
  );
}
/**
 * 根据 content 中的 outputFormat 来处理 value；
 * 如果 outputFormat 处理后的值是对象类型，会覆盖（Object.assign）到 value 上
 */

// value 是待处理的值，content 是一个数组，strict 是一个可选的参数，默认为 false。（当 strict 为 true 时，只返回设置的表单项的值, 过滤掉冗余字段, ）
export function transformOutputValue(value, content, { strict = false } = {}) {
  // 参数的值创建一个新的对象 newVal，如果 strict 为 true，则创建一个空对象，否则创建一个与输入 value 一样的对象的副本。
  const newVal = strict ? {} : { ...value };

  Object.keys(value).forEach((id) => {
    // 找出表单项
    const item = content.value.find((item) => item.id === id);
    if (!item) return;
    // 除去多选
    if (item.type !== "group") {
      // 用于处理输出值，参数为对应组件返回值
      // 如果处理后的值是对象类型，会覆盖（Object.assign）到整个表单的值上
      if (item.outputFormat) {
        const v = item.outputFormat(value[id]);
        // REVIEW: 仅根据 format 后的类型来判断赋值形式，有些隐晦
        //   (boolean): 如果 value 为一个普通对象，那么返回 true，否则返回 false(({ 'x': 0, 'y': 0 }); (Object.create(null));)
        if (_isplainobject(v)) Object.assign(newVal, v);
        else newVal[id] = v;
      } else {
        // 如果 item 没有 outputFormat 属性，直接将 value[id] 赋值给 newVal[id]。
        newVal[id] = value[id];
      }
    } else {
      // 多选递归处理
      newVal[id] = transformOutputValue(value[id], item.items, { strict });
    }
  });

  return newVal;
}

/**
 * 根据 content 中的 inputFormat 来处理 value
 * inputFormat 接受的是当前层级的 value
 * 复杂点在于，不管传入的 value 是否包含某表单项的 key，所有使用了 inputFormat 的项都有可能在这次 update 中被更新
 */
export function transformInputValue(value, content) {
  // 首先，创建了一个名为 newVal 的新对象，它是 value 的副本，以便在不修改原始数据的情况下进行操作。
  const newVal = { ...value };
  const processItem = (item) => {
    const { id } = item;
    if (item.inputFormat) {
      // 对于每个 item，它检查是否存在 inputFormat 属性。如果存在，它将调用 item.inputFormat(value) 来处理 value，
      // 然后将处理后的结果赋值给 newVal 的相应属性（根据 id 来确定属性名），但仅在处理后的值不为 undefined 时才会进行赋值。
      const v = item.inputFormat(value);
      if (v !== undefined) newVal[id] = v;
    } else if (id in value) {
      // 如果 item 没有 inputFormat 属性，它会检查是否 value 中存在与 item 的 id 相匹配的属性。如果存在，它会将该属性的值赋值给 newVal 的相应属性。
      if (item.type !== "group") {
        newVal[id] = value[id];
      } else {
        // 如果 item 的类型是 "group"，则会递归调用 transformInputValue 函数来处理嵌套的对象。
        newVal[id] = transformInputValue(value[id], item.items);
      }
    }
  };
  //  判断响应式数据的类型
  const itemsToProcess = content.value || content;
  itemsToProcess.forEach(processItem);
  return newVal;
}

// 对 group checkbox-group初始化值修正默认为空数组
export function correctValue(value, content) {
  content.forEach(({ type, id, items }) => {
    switch (type) {
      case "group":
        if (!(id in value)) value[id] = {};
        correctValue(value[id], items);
        break;
      case "checkbox-group":
        if (!(id in value)) value[id] = [];
        break;
    }
  });
}
/**
 * 递归合并 oldV & newV，策略如下：
 * 1. 如果该项的 type 不是 GROUP，直接覆盖合并到 oldV
 * 2. 如果是，则递归执行步骤 1
 */
export function mergeValue(oldV, newV, content) {
  // 遍历 newV 对象的所有属性
  Object.keys(newV).forEach((k) => {
    // 对于每个属性 k，首先尝试在 content 数组中查找具有相同 id 值的项，如果找不到则使用一个空对象。
    const item = content.value.find((item) => item.id === k) || {};
    // 如果不是 "group" 类型, 就直接将 newV 中的属性值覆盖到 oldV 中的对应属性上，实现合并。
    if (item.type !== "group") oldV[k] = newV[k];
    // 如果项的类型是 "group"，则递归调用这个函数 mergeValue，以进一步合并 oldV[k] 和 newV[k]，并传入该项的子项数组 item.items 作为 content 参数。
    else mergeValue(oldV[k], newV[k], item.items);
  });
}
export function noop() {}
