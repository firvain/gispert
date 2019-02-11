// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuex from 'vuex';
import VueI18n from 'vue-i18n';
import VueSocketio from 'vue-socket.io';
import moment from 'moment';

import 'vuetify/dist/vuetify.min.css';
import App from './App';
import router from './router';
import store from './store';
import config from './config';
import messages from './i18n/languages';

const SocialSharing = require('vue-social-sharing');
const HelloJs = require('hellojs/dist/hello.all.min.js');
const VueHello = require('vue-hellojs');

const GOOGLE_APP_CLIENT_ID = config.googleId;
const FACEBOOK_APP_CLIENT_ID = config.facebookId;
const LINKEDIN_APP_CLIENT_ID = config.linkedinId;
HelloJs.init({
  google: GOOGLE_APP_CLIENT_ID,
  facebook: FACEBOOK_APP_CLIENT_ID,
  linkedin: LINKEDIN_APP_CLIENT_ID,
}, {
  scope: ['email'],
  force: true,
  redirect_uri: '/',
});
Vue.use(VueHello, HelloJs);

/* eslint-disable */
Vue.prototype.$eventHub = new Vue(); // Global event bus
Vue.prototype.moment = moment;

Vue.config.productionTip = false;

Vue.use(Vuex);
Vue.use(SocialSharing);
Vue.use(VueI18n);
Vue.use(VueSocketio, `${config.surl}`);

const i18n = new VueI18n({
  locale: 'el_GR', // set locale
  // fallbackLocale: 'en',
  messages // set locale messages
})


/* eslint-disable no-new */
export const app = new Vue({
  i18n,
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App },
});


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

Array.prototype.common = function common(arr1, arr2) {
  var newArr = [];
  newArr = arr1.filter(function(v){ return arr2.indexOf(v) >= 0;})
  newArr.concat(arr2.filter(function(v){ return newArr.indexOf(v) >= 0;}));
  return newArr;
}

Array.prototype.difference = function difference (array1, array2) {
  const temp = [];
  for (var i in array1) {
    if(!array2.includes(array1[i])) temp.push(array1[i]);
    console.log(temp);
  }
  return temp;
}

export default i18n;
