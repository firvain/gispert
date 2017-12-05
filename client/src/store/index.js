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
  },
  actions: {
    setFeature(state, data) {
      state.commit('setSelected', data);
    },
    addNewPostFeature(state, data) {
      state.commit('newPostFeature', data);
    },
    setPostIdToAddFeatures(state, data) {
      state.commit('addingToPost', data);
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
  },
  getters: {
    getDrawnFeatures(state) {
      return state.storage;
    },
  },
});
