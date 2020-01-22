import Vue from "vue";
import Router from "vue-router";
import linkify from "vue-linkify";
// import Register from '@/components/register';
import Main from "@/components/main";
// import Login from '@/components/login';
import Home from "@/components/home";
// import questionnaireView from '@/components/questionnaireView';
// import userList from '@/components/userlist';
// import customMaps from '@/components/custom_map_list';
// import Search from '@/components/search';

Vue.use(Router);
Vue.directive("linkified", linkify);

export default new Router({
  // mode: 'history',
  routes: [
    // {
    //   path: '/register',
    //   name: 'register',
    //   component: Register,
    // },
    // {
    //   path: '/login',
    //   name: 'login',
    //   component: Login,
    // },
    {
      path: "/",
      name: "home",
      component: Home
    },
    // {
    //   path: '/q',
    //   name: 'q',
    //   component: questionnaireView,
    // },
    {
      path: "/app",
      name: "main",
      component: Main,
      children: [
        {
          path: "post/:id",
          name: "post",
          component: Main
        },
        {
          path: "collection/:id",
          name: "collection",
          component: Main
        },
        {
          path: "questionnaire/:id",
          name: "questionnaire",
          component: Main
        },
        {
          path: "questionnaireResults/:id",
          name: "questionnaireResults",
          component: Main
        },
        {
          path: "questionnaireEditor/:id",
          name: "questionnaireEditor",
          component: Main
        }
      ]
    }
  ]
});
