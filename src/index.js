import elFormRenderer from "./components/femessage/el-form-renderer.vue"; // 引入封装好的组件
export { elFormRenderer }; //实现按需引入*
const coms = [elFormRenderer]; // 将来如果有其它组件,都可以写到这个数组里

const components = [elFormRenderer];
const install = function (App, options) {
  components.forEach((component) => {
    App.component(component.name, component);
  });
};
export default { install }; // 批量的引入*
