import Vue from 'vue';
import Vuetify from 'vuetify';
import Router from 'vue-router';
import linkify from 'vue-linkify';
import Register from '@/components/register';
import Main from '@/components/main';
import Login from '@/components/login';
import Home from '@/components/home';
import userList from '@/components/userlist';
import customMaps from '@/components/custom_map_list';
import Search from '@/components/search';

Vue.use(Router);
Vue.use(Vuetify);
Vue.directive('linkified', linkify);

export default new Router({
  routes: [
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/main',
      name: 'main',
      component: Main,
      children: [
        {
          path: 'home',
          name: 'home',
          component: Home,
        },
        {
          path: 'userList',
          name: 'userList',
          component: userList,
        },
        {
          path: 'custommaps',
          name: 'customMapsNoId',
          component: customMaps,
        },
        {
          path: 'custommaps/:id',
          name: 'customMaps',
          component: customMaps,
        },
        {
          path: 'search',
          name: 'search',
          component: Search,
        },
        {
          path: 'search/:id',
          name: 'searchId',
          component: Search,
        },
        {
          path: 'search/collection/:id',
          name: 'searchCollection',
          component: Search,
        },
      ],
    },
  ],
});
