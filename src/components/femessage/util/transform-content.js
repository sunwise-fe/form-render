import _kebabcase from "lodash.kebabcase";
export default function transformContent(content) {
  return content.map(({ ...item }) => {
    if (item.type === "group") {
      item.items = transformContent(item.items);
    } else {
      removeDollarInKey(item);
      setItemId(item);
      extractRulesFromComponent(item);
      // 有些旧写法是 checkboxGroup & radioGroup
      // 转换字符串string为kebab case.（foo-bar）
      item.type = _kebabcase(item.type);
    }

    return item;
  });
}
// 兼容旧写法：$id、$name
function removeDollarInKey(item) {
  Object.keys(item)
    //   首先检查属性名是否以"$"开头,然后检查去掉"$"后的属性名是否不在对象item中。
    .filter((k) => k.startsWith("$") && !(k.slice(1) in item))
    //   将对象item中的k属性的值赋给item[k.slice(1)]，然后删除原来的k属性，以实现将"$"去除的操作。
    .forEach((k) => ((item[k.slice(1)] = item[k]), delete item[k]));
}

// 为一个对象 item 设置一个 id 属性，但只有在 item 的 id 属性不存在时才会执行。
function setItemId(item) {
  if (item.id) return;
  // name 是符合表单项直觉的命名； prop 是为了与 element 的 table 的 columns 匹配
  item.id = item.name || item.prop;
}

// 其作用是从给定的 item 参数中提取规则并将其添加到 item.rules 属性中
export function extractRulesFromComponent(item) {
  // 是否覆盖自定义组件内置的校验规则;(overrideRules:true不校验组件内规则)
  if (item.overrideRules) return;
  const { component } = item;

  // 使用全局注册的组件暂时无法处理(处理自定义组件内的rules)
  if (!component || typeof component === "string") return;
  console.log(component);
  const { rules = [] } = component;
  item.rules = [
    ...(item.rules || []),
    ...(typeof rules === "function" ? rules(item) : rules),
  ];
}
