// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuex from 'vuex';
import 'vuetify/dist/vuetify.min.css';
import App from './App';
import router from './router';
import store from './store';

const SocialSharing = require('vue-social-sharing');
/* eslint-disable */

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App },
});

Vue.use(Vuex);
Vue.use(SocialSharing);

// Register a global custom directive called v-focus
Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
  }
})

Array.prototype.remove = function remove() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
