import Vue from 'vue';
import Vuex from 'vuex';
// import ol from 'openlayers';

/* eslint-disable */
Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  state: {
    featureId: undefined,
    feature: undefined,
    newpostfeature: undefined,
    addingToPost: undefined,
    featureCount: 0,
    token: null,
    user: null,
    isUserLoggedIn: false,
    privateCollections: [],
    publicCollections: [],
    timeline: [],
    collectionTimeline: [],
    userTimeline: [],
    users: [],
    customMaps: [],
    notifications: [],
    openedTimeline: null,
    previousOpenedTimeline: null,
    liveUsersList: null,
    activeTab: 1,
    selectedPost: '',
    questionnaireFeatures: [],
    questionnaireMode: null,
    questionnaireFeatureId: null,
    drawnFeatureStyle: {
      strkWdth: 1,
      strkClr: 'blue',
      fllClr: 'orange',
      messages: undefined,
    },
    questionnaire: null,
    questionnairesIHaveAnswered: null,
    myQuestionnaires: null,
    userPost : {
      userId: null,
      userName: null,
      text: null,
      timestamp: null,
      userFeatures: [],
      collection: null,
      replies: [],
      isReplyTo: null,
      type: null,
      images: null,
      videos: null,
    },
  },
  actions: {
    setDrawnFeatureStyle(state, data) {
      state.commit(setDrawnFeatureStyle, data);
    },
    resetUserPost(state) {
      state.commit('resetUserPost');
    },
    setUserPostProperties(state, data) {
      state.commit('setUserPostProperties', data);
    },
    setMyQuestionnaires(state, data) {
      state.commit('setMyQuestionnaires', data);
    },
    setQuestionnairesIHaveAnswered(state, data) {
      state.commit('setQuestionnairesIHaveAnswered', data);
    },
    setQuestionnaire(state, data) {
      state.commit('setQuestionnaire', data);
    },
    setQuestionnaireMode(state, data) {
      state.commit('setQuestionnaireMode', data);
    },
    setQuestionnaireFeatureId(state, data) {
      state.commit('setQuestionnaireFeatureId', data);
    },
    resetQuestionnaire(state) {
      state.commit('resetQuestionnaire');
    },
    setSelectedPost(state, data) {
      state.commit('setSelectedPost', data);
    },
    setActiveTab(state, data) {
      state.commit('setActiveTab', data);
    },
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
    setCollectionTimeline(state, data) {
      state.commit('setCollectionTimeline', data);
    },
    setUserTimeline(state, data) {
      state.commit('setUserTimeline', data);
    },
    addPageToTimeline(state,data) {
      state.commit('addPageToTimeline', data);
    },
    addPageToCollectionTimeline(state, data) {
      state.commit('addPageToCollectionTimeline', data);
    },
    addPageToUserTimeline(state, data) {
      state.commit('addPageToUserTimeline', data);
    },
    addPostToTimeline(state, data) {
      state.commit('addPostToTimeline', data);
    },
    addPostToUserTimeline(state, data) {
      state.commit('addPostToUserTimeline', data);
    },
    addPostToCollectionView(state, data) {
      state.commit('addPostToCollectionView', data);
    },
    addRepliesToPost (state, data) {
      state.commit('addRepliesToPost', data);
    },
    addReplyToThread (state, data) {
      state.commit('addReplyToThread', data);
    },
    setUsers(state, data) {
      state.commit('setusers', data);
    },
    resetFeatureCount(state, data) {
      state.commit('resetfeaturecount', data);
    },
    // setCustomMaps(state, data) {
    //   state.commit('setcustommaps', data);
    // },
    setNotifications(state, data) {
      state.commit('setNotifications', data);
    },
    addPublicCollection(state, data) {
      state.commit('addPublicCollection', data);
    },
    addPrivateCollection(state, data) {
      state.commit('addPrivateCollection', data);
    },
    setOpenedCustomTimeline(state, data) {
      state.commit('setOpenedCustomTimeline', data);
    },
    addNotificationFromSocket(state, data) {
      state.commit('addNotificationFromSocket', data);
    },
    addEditor(state,data) {
      state.commit('addEditor', data);
    },
    removeEditor(state,data) {
      state.commit('removeEditor', data);
    },
    addImageToPost(state,data) {
      state.commit('addImageToPost', data);
    },
    addVideoToPost(state,data) {
      state.commit('addVideoToPost', data);
    },
    // setLiveUsers(state, data) {
    //   state.commit('setLiveUsers', data);
    // },
    addQuestionnaireFeature(state, data) {
      state.commit('addQuestionnaireFeature', data);
    },
  },
  mutations: {
    setDrawnFeatureStyle(state, data) {
      state.drawnFeatureStyle.strkWdth = data.strkWdth;
      state.drawnFeatureStyle.strkClr = data.strkClr;
      state.drawnFeatureStyle.fllClr = data.fllClr;
      state.drawnFeatureStyle.messages = data.messages;
    },
    resetUserPost(state) {
      state.userPost = {
        userId: null,
        userName: null,
        text: null,
        timestamp: null,
        userFeatures: [],
        collection: null,
        replies: [],
        type: null,
        images: null,
        videos: null,
      };
    },
    setUserPostProperties(state, data) {
      console.log(data);
      data.forEach((p) => {
        if (p.property === 'userFeatures') {
          state.userPost['userFeatures'].push(p.value);
        } else if (p.property === 'videos') {
          state.userPost['videos'] = p.value;
        } else {
          state.userPost[p.property] = p.value;
        }
      });
    },
    setMyQuestionnaires(state, data) {
      state.myQuestionnaires = data;
    },
    setQuestionnairesIHaveAnswered(state, data) {
      state.questionnairesIHaveAnswered = data;
    },
    resetQuestionnaire(state) {
      state.questionnaireFeatureId = null;
      state.questionnaireFeatures = [];
    },
    setQuestionnaireFeatureId(state, data) {
      state.questionnaireFeatureId = data;
    },
    addQuestionnaireFeature(state, feature) {
      state.questionnaireFeatures = state.questionnaireFeatures.filter(function( obj ) {
        return obj.get('buttonId') !== state.questionnaireFeatureId;
      });

      feature.setProperties({
        buttonId: this.state.questionnaireFeatureId,
      });
      state.questionnaireFeatures.push(feature);
    },
    setQuestionnaireMode(state, data) {
      state.questionnaireMode = data;
    },
    setQuestionnaire(state, data) {
      state.questionnaire = data;
    },
    setNotifications(state, data) {
      state.notifications = data;
    },
    setSelected(state, data) {
      state.selectedPost = '';
      if (data) {
        state.feature = data;
        if (data.get('mongoID')) {
          state.featureId = data.get('mongoID');
        }
      } else {
        state.feature = undefined;
      }
    },
    // newPostFeature(state, data) {
    //   console.log('type :: ', data);
    //   state.newpostfeature = data;
    //   const feature = state.newpostfeature;
    //   state.featureCount += 1;
    //   feature.drawId = state.featureCount;
    //   feature.setProperties({
    //     'mongoID': state.user._id + '' + Date.now(),
    //     'name': '@' + state.user.name,
    //     'userId': state.user._id,
    //   });

    //   if (state.storage.length > 0) {
    //     const objIndex = state.storage.findIndex((obj => obj.id == state.addingToPost.id));
    //     if (!state.storage[objIndex].features) {
    //       state.storage[objIndex].features = [];
    //     }
    //     if (objIndex > -1) {
    //       state.storage[objIndex].features.push(feature);
    //     } else {
    //       state.storage.push({ id: state.addingToPost.id, type: state.addingToPost.type, features: [feature] });
    //     }
    //   } else {
    //     state.storage.push({ id: state.addingToPost.id, type: state.addingToPost.type, features: [feature] });
    //   }
    // },
    clearNewPostFeatures(state, data) {
      let allResponses = state.storage;
      const toDelete = new Set([data]);
      // console.log(allResponses);
      const restResponses = allResponses.filter(obj => !toDelete.has(obj.id));
      state.storage = restResponses;
    },
    addingToPost(state, data) {
      console.log('setting adding to post:: ', JSON.stringify(data));
      state.addingToPost = data;
    },
    deleteFeatureFromPost(state, data) {
      const restFeatures = [];
      const allFeatures = state.userPost.userFeatures;
      allFeatures.forEach((p) => {
        if (p.search(data) === -1) {
          restFeatures.push(p);
        }
      });
      state.userPost.userFeatures = restFeatures;
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
      console.log('deleting collection::', id);
      let collections = state.privateCollections;
      const toDelete = new Set([id]);
      const restCollections = collections.filter(obj => !toDelete.has(obj._id));
      state.privateCollections = collections.filter(obj => !toDelete.has(obj._id));
      state.collections = restCollections;
    },
    deletepubliccollection(state, id) {
      console.log('deleting collection::', id);
      let collections = state.publicCollections;
      const toDelete = new Set([id]);
      const restCollections = collections.filter(obj => !toDelete.has(obj._id));
      state.publicCollections = collections.filter(obj => !toDelete.has(obj._id));
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
    // resetfeaturecount(state, data) {
    //   state.featureCount = 0;
    //   state.newpostfeature = undefined;
    //   state.storage = [];
    // },
    setcustommaps(state, data) {
      if (data !== 'empty') {
        data.forEach((m) => {
          state.customMaps.push(m);
        });
      } else {
        state.customMaps = [];
      }
    },
    addNotificationFromSocket(state, data) {
      this.state.notifications.push(data);
    },
    setCollectionTimeline(state, data) {
      state.collectionTimeline = data;
    },
    setUserTimeline(state, data) {
      state.userTimeline = data;
    },
    addPublicCollection(state, data) {
      this.state.publicCollections.push(data);
    },
    addPrivateCollection(state, data) {
      this.state.privateCollections.push(data);
    },
    setOpenedCustomTimeline(state, data) {
      this.state.previousOpenedTimeline = this.state.openedTimeline;
      this.state.openedTimeline = data;
    },
    addPostToTimeline(store, data) {
      console.log('adding post to timeline in vuex::', data);
      this.state.timeline.unshift(data);
    },
    addPostToUserTimeline(store, data) {
      this.state.userTimeline.unshift(data);
    },
    addPostToCollectionView(store, data) {
      console.log('adding to collection::', data);
      this.state.collectionTimeline.unshift(data);
    },
    addRepliesToPost (state, data) {
      const objIndex = state.timeline.findIndex((obj => obj._id == data._id));
      console.log('vuex adding reply to post:: ', objIndex, data);
      if (objIndex > -1) {
        data.posts.forEach((p) => {
          state.timeline[objIndex].posts.push(p);
        });
      }
      if (state.openedTimeline !== null) {
        if (state.openedTimeline.type === 'collection') {
          const objIndex = state.collectionTimeline.findIndex((obj => obj._id == data._id));
          console.log('adding reply to collection:: ', objIndex, data);
          if (objIndex > -1) {
            data.posts.forEach((p) => {
              state.collectionTimeline[objIndex].posts.push(p);
            });
          }
        }
        if (state.openedTimeline.type === 'timeline') {
          const objIndex = state.userTimeline.findIndex((obj => obj._id == data._id));
          console.log('adding reply to userTimeline:: ', objIndex, data);
          if (objIndex > -1) {
            data.posts.forEach((p) => {
              state.userTimeline[objIndex].posts.push(p);
            });
          }
        }
      }
    },
    addReplyToThread (state, data) {
      const objIndex = state.timeline.findIndex((obj => obj._id == data.isReplyTo));
      console.log('vuex adding reply to thread:: ', objIndex, data);
      if (objIndex > -1) {
        state.timeline[objIndex].posts.unshift(data);
      }
      if (state.openedTimeline !== null) {
        if (state.openedTimeline.type === 'collection') {
          const objIndex = state.collectionTimeline.findIndex((obj => obj._id == data.isReplyTo));
          console.log('adding reply to collection:: ', objIndex, data);
          if (objIndex > -1) {
            state.collectionTimeline[objIndex].posts.unshift(data);
          }
        }
        if (state.openedTimeline.type === 'timeline') {
          const objIndex = state.userTimeline.findIndex((obj => obj._id == data.isReplyTo));
          console.log('adding reply to userTimeline:: ', objIndex, data);
          if (objIndex > -1) {
            state.userTimeline[objIndex].posts.unshift(p);
          }
        }
      }
    },
    // setLiveUsers (state, data) {
    //   state.liveUsersList = data;
    // },
    setActiveTab (state, data) {
      state.activeTab = data;
    },
    addPageToTimeline(state,data) {
      state.timeline.push(data);
    },
    addPageToCollectionTimeline(state, data) {
      state.collectionTimeline.push(data);
    },
    addPageToUserTimeline(state, data) {
      state.userTimeline.push(data);
    },
    setSelectedPost (state, data) {
      state.selectedPost = data;
    },
    addEditor (state, data) {
      console.log('adding editor::', data);
      const collectionId = data;
      const objIndexPrivate = state.privateCollections.findIndex((obj => obj._id == collectionId));
      const objIndexPublic = state.publicCollections.findIndex((obj => obj._id == collectionId));
      console.log('search results:: ', objIndexPrivate, objIndexPublic);

      if (objIndexPrivate !== -1) {
        state.privateCollections[objIndexPrivate].isEditor = true;
      }
      if (objIndexPublic !== -1) {
        state.publicCollections[objIndexPublic].isEditor = true;
      }

      state.timeline.forEach((thread) => {
        if (thread.posts[0].collectionData[0]._id === collectionId) {
          thread.posts[0].collectionData[0].isEditor = true;
        }
      });

      state.collectionTimeline.forEach((thread) => {
        if (thread.posts[0].collectionData[0]._id === collectionId) {
          thread.posts[0].collectionData[0].isEditor = true;
        }
      });

      state.userTimeline.forEach((thread) => {
        if (thread.posts[0].collectionData[0]._id === collectionId) {
          thread.posts[0].collectionData[0].isEditor = true;
        }
      });
    },
    removeEditor (state, data) {
      console.log('removing editor::', data);
      const collectionId = data;
      const objIndexPrivate = state.privateCollections.findIndex((obj => obj._id == collectionId));
      const objIndexPublic = state.publicCollections.findIndex((obj => obj._id == collectionId));
      console.log('search results:: ', objIndexPrivate, objIndexPublic);

      if (objIndexPrivate !== -1) {
        state.privateCollections[objIndexPrivate].isEditor = false;
      }
      if (objIndexPublic !== -1) {
        state.publicCollections[objIndexPublic].isEditor = false;
      }

      state.timeline.forEach((thread) => {
        if (thread.posts[0].collectionData[0]._id === collectionId) {
          thread.posts[0].collectionData[0].isEditor = false;
        }
      });

      state.collectionTimeline.forEach((thread) => {
        if (thread.posts[0].collectionData[0]._id === collectionId) {
          thread.posts[0].collectionData[0].isEditor = false;
        }
      });

      state.userTimeline.forEach((thread) => {
        if (thread.posts[0].collectionData[0]._id === collectionId) {
          thread.posts[0].collectionData[0].isEditor = false;
        }
      });
    },
    removeCollectionFromTimeline(state, data) {
      console.log('removing collection from TL::', data, state.timeline);
      state.timeline = state.timeline.filter(function (obj) {
        return obj.posts[0].collectionData[0]._id !== data;
      });
      console.log('new timeline:: ', state.timeline);
    },
    // addImageToPost(state,data) {
    //   if (state.storage.length > 0) {
    //     const objIndex = state.storage.findIndex((obj => obj.id == state.addingToPost.id));
    //     state.storage[objIndex].images = [];
    //     // if (!state.storage[objIndex].images) {
    //     //   state.storage[objIndex].images = [];
    //     // }
    //     if (objIndex > -1) {
    //       state.storage[objIndex].images.push(data);
    //     } else {
    //       state.storage.push({ id: state.addingToPost.id, type: state.addingToPost.type, images: [data] });
    //     }
    //   } else {
    //     state.storage.push({ id: state.addingToPost.id, type: state.addingToPost.type, images: [data] });
    //   }
    // },
    // addVideoToPost(state,data) {
    //   if (state.storage.length > 0) {
    //     const objIndex = state.storage.findIndex((obj => obj.id == state.addingToPost.id));
    //     state.storage[objIndex].videos = [];
    //     // if (!state.storage[objIndex].videos) {
    //     //   state.storage[objIndex].videos = [];
    //     // }
    //     if (objIndex > -1) {
    //       state.storage[objIndex].videos.push(data);
    //     } else {
    //       state.storage.push({ id: state.addingToPost.id, type: state.addingToPost.type, videos: [data] });
    //     }
    //   } else {
    //     state.storage.push({ id: state.addingToPost.id, type: state.addingToPost.type, videos: [data] });
    //   }
    // },
  },
  getters: {
    getUserPostMongoIDs(state) {
      const ids = [];
      const features = state.userPost.userFeatures;
      features.forEach((f) => {
        const featureObject = JSON.parse(f);
        console.log(featureObject);
        ids.push(featureObject.features[0].properties.mongoID);
      });
      return ids;
    },
    getUserPost(state) {
      return state.userPost;
    },
    getDrawnFeatures(state) {
      return state.storage;
    },
    getLatestDrawnFeature(state) {
      return state.newpostfeature;
    },
    notificationsGetter(state) {
      const unreadNotifications = state.notifications.filter(function (notification) {
        return notification.read === 0;
      });
      const notifications = {
        messages: unreadNotifications,
        number: state.notifications.length,
        color: 'blue',
      }
      return notifications;
    },
  },
});
