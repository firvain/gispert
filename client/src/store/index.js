import Vue from 'vue';
import Vuex from 'vuex';

/* eslint-disable */
Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  state: {
    feature: undefined,
    newpostfeature: undefined,
    addingToPost: undefined,
    storage: [],
    featureCount: 0,
    token: null,
    user: null,
    isUserLoggedIn: false,
    privateCollections: [],
    publicCollections: [],
    timeline: [],
    users: [],
    customMaps: [],
    notifications: [],
  },
  actions: {
    setFeature(state, data) {
      state.commit('setSelected', data);
    },
    addNewPostFeature(state, data) {
      state.commit('newPostFeature', data);
    },
    removeNewPostFeature(state) {
      state.commit('removePostFeature');
    },
    setPostIdToAddFeatures(state, data) {
      state.commit('addingToPost', data);
    },
    setUser(state, data) {
      state.commit('setuser', data);
    },
    setToken(state,data) {
      state.commit('settoken', data);
    },
    setPrivateCollections(state,data) {
      state.commit('setprivatecollections', data);
    },
    setPublicCollections(state,data) {
      state.commit('setpubliccollections', data);
    },
    deletePrivateCollection(state,data) {
      state.commit('deleteprivatecollection', data);
    },
    deletePublicCollection(state,data) {
      state.commit('deletepubliccollection', data);
    },
    editPrivateCollection(state,data) {
      state.commit('editprivatecollection', data);
    },
    editPublicCollection(state,data) {
      state.commit('editpubliccollection', data);
    },
    setTimeline(state,data) {
      state.commit('setTimeline', data);
    },
    setUsers(state, data) {
      state.commit('setusers', data);
    },
    resetFeatureCount(state, data) {
      state.commit('resetfeaturecount', data);
    },
    setCustomMaps(state, data) {
      state.commit('setcustommaps', data);
    },
    setNotifications(state, data) {
      state.commit('setNotifications', data);
    },
  },
  mutations: {
    setNotifications(state, data) {
      state.notifications = data;
    },
    setSelected(state, data) {
      state.feature = data;
    },
    newPostFeature(state, data) {
      state.newpostfeature = data;
      const post = state.addingToPost;
      const feature = state.newpostfeature;
      state.featureCount += 1;
      feature.drawId = state.featureCount;
      feature.mongoID = state.user._id + '' + Date.now();
      feature.name = '@' + state.user.name;
      if (state.storage.length > 0) {
        const objIndex = state.storage.findIndex((obj => obj.id == post));
        if (objIndex > -1) {
          state.storage[objIndex].features.push(feature);
        } else {
          state.storage.push({ id: post, features: [feature] });
        }
      } else {
        state.storage.push({ id: post, features: [feature] });
      }
    },
    clearNewPostFeatures(state) {
      let allResponses = state.storage;
      const toDelete = new Set(['newPost']);
      // console.log(allResponses);
      const restResponses = allResponses.filter(obj => !toDelete.has(obj.id));
      state.storage = restResponses;
    },
    addingToPost(state, data) {
      state.addingToPost = data;
    },
    deleteFeatureFromPost(state, data) {
      const allFeatures = state.storage;
      allFeatures.forEach((p) => {
        const toDelete = new Set([data]);
        p.features = p.features.filter(obj => !toDelete.has(obj.drawId));
      });
    },
    setuser(state, data) {
      state.user = data;
    },
    settoken(state, data) {
      state.token = data;
      if (state.token) {
        state.isUserLoggedIn = true;
      } else {
        state.isUserLoggedIn = false;
      }
    },
    setprivatecollections(state, data) {
      state.privateCollections = data;
    },
    setpubliccollections(state, data) {
      state.publicCollections = data;
    },
    deleteprivatecollection(state, id) {
      let collections = state.privateCollections;
      const toDelete = new Set([id]);
      const restCollections = collections.filter(obj => !toDelete.has(obj._id));
      state.collections = restCollections;
    },
    deletepubliccollection(state, id) {
      let collections = state.publicCollections;
      const toDelete = new Set([id]);
      const restCollections = collections.filter(obj => !toDelete.has(obj._id));
      state.collections = restCollections;
    },
    editprivatecollection(state, data) {},
    editpubliccollection(state, data) {},
    setTimeline(state, data) {
      state.timeline = data;
    },
    setusers(state, data) {
      if (data !== 'empty') {
        data.forEach((u) => {
          state.users.push(u);
        });
      } else {
        state.users = [];
      }
    },
    resetfeaturecount(state, data) {
      state.featureCount = 0;
      state.newpostfeature = undefined;
      state.storage = [];
    },
    setcustommaps(state, data) {
      if (data !== 'empty') {
        data.forEach((m) => {
          state.customMaps.push(m);
        });
      } else {
        state.customMaps = [];
      }
    },

  },
  getters: {
    getDrawnFeatures(state) {
      return state.storage;
    },
    notificationsGetter(state) {
      const notifications = {
        messages: state.notifications,
        number: state.notifications.length,
        color: 'blue',
      }
      return notifications;
    },
  },
});
