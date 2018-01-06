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
  },
  mutations: {
    setSelected(state, data) {
      state.feature = data;
    },
    newPostFeature(state, data) {
      state.newpostfeature = data;
      const post = state.addingToPost;
      const feature = state.newpostfeature;
      state.featureCount += 1;
      feature.drawId = state.featureCount;
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
  },
  getters: {
    getDrawnFeatures(state) {
      return state.storage;
    },
  },
});
