import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../view/HomeView.vue";
import AboutView from "../view/AboutView.vue";
import checkboxGroup from "../view/checkboxGroup.vue";
import content from "../view/content.vue";
import setoptios from "../view/setoptios.vue";
import picker from "../view/picker.vue";
import format from "../view/format.vue";
import update from "../view/update.vue";
import slot from "../view/slot.vue";
import hidden from "../view/hidden.vue";
import disabled from "../view/disabled.vue";
import vmodel from "../view/vmodel.vue";
import rules from "../view/rules.vue";
import next from "../view/next.vue";
import readonly from "../view/readonly.vue";
import label from "../view/label.vue";
import getform from "../view/getform.vue";
import getcomponent from "../view/getcomponent.vue";
import deprecated from "../view/deprecated.vue";
import el from "../view/el.vue";
import radioGroup from "../view/radioGroup.vue";
import remote from "../view/remote.vue";
import rulesPlus from "../view/rulesPlus.vue";
import MyInput from "../view/MyInput.vue";
import testAttrs from "../view/testAttrs.vue";
const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
  },
  {
    path: "/checkboxGroup",
    name: "checkboxGroup",
    component: checkboxGroup,
  },
  {
    path: "/content",
    name: "content",
    component: content,
  },
  {
    path: "/setoptios",
    name: "setoptios",
    component: setoptios,
  },
  {
    path: "/picker",
    name: "picker",
    component: picker,
  },
  {
    path: "/format",
    name: "format",
    component: format,
  },
  {
    path: "/update",
    name: "update",
    component: update,
  },
  {
    path: "/slot",
    name: "slot",
    component: slot,
  },
  {
    path: "/hidden",
    name: "hidden",
    component: hidden,
  },
  {
    path: "/disabled",
    name: "disabled",
    component: disabled,
  },
  {
    path: "/vmodel",
    name: "vmodel",
    component: vmodel,
  },
  {
    path: "/rules",
    name: "rules",
    component: rules,
  },
  {
    path: "/next",
    name: "next",
    component: next,
  },
  {
    path: "/readonly",
    name: "readonly",
    component: readonly,
  },
  {
    path: "/label",
    name: "label",
    component: label,
  },
  {
    path: "/getform",
    name: "getform",
    component: getform,
  },
  {
    path: "/getcomponent",
    name: "getcomponent",
    component: getcomponent,
  },
  {
    path: "/deprecated",
    name: "deprecated",
    component: deprecated,
  },
  {
    path: "/el",
    name: "el",
    component: el,
  },
  {
    path: "/radioGroup",
    name: "radioGroup",
    component: radioGroup,
  },
  {
    path: "/remote",
    name: "remote",
    component: remote,
  },
  {
    path: "/rulesPlus",
    name: "rulesPlus",
    component: rulesPlus,
  },
  {
    path: "/MyInput",
    name: "MyInput",
    component: MyInput,
  },
  {
    path: "/testAttrs",
    name: "testAttrs",
    component: testAttrs,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
