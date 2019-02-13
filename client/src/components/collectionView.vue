<template>
    <v-container fluid>
      <h5 class="text-xs-center">{{ $store.state.openedTimeline.title }}
        <!-- <v-btn fab small outline
          v-if='isMember && $store.state.user && $store.state.openedTimeline.userCreated !== $store.state.user._id'
          @click="unfollowCollectionDialog = true">
          <v-icon color="red lighten-1">visibility_off</v-icon>
        </v-btn>
        <v-btn fab small outline
          v-if='!isMember && $store.state.user && $store.state.openedTimeline.userCreated !== $store.state.user._id'
          @click="followCollection">
          <v-icon color="green lighten-1">visibility</v-icon>
        </v-btn> -->
      </h5>
      <newPostCollection v-if="$store.state.isUserLoggedIn === true && collection.isEditor === true || collection.visibility === 'public'"></newPostCollection>
      <!-- <newPostCollection v-if="$store.state.isUserLoggedIn === true && collection.visibility === 'public'"></newPostCollection> -->
      
      <v-flex
        md12
        v-for="thread in $store.state.collectionTimeline"
        :key="thread._id"
      >
        <thread :thread='thread'></thread>
      </v-flex>
      <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
      <v-btn
        v-on:click='next_page'
        v-if="!endOfPosts && !loading"
        class="blue-grey white--text"
        block
      >
        {{ $t('message.loadMore')}}
        <v-icon right dark>navigate_next</v-icon>
      </v-btn>
      <span v-if="$store.state.collectionTimeline.length === 0 && !loading">{{ $t('message.noPosts')}}</span>

      <v-dialog v-model="unfollowCollectionDialog" persistent max-width="290">
        <v-card>
          <v-card-title class="headline">{{ $t('message.followCollection')}}</v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat @click.native="unfollowCollection($store.state.openedTimeline.id)">{{ $t('message.stopFollowing')}}</v-btn>
            <v-btn color="green darken-1" flat @click.native="unfollowCollectionDialog = false">{{ $t('message.cancel')}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>
</template>
<script>
import axios from 'axios';
import { mapActions } from 'vuex';
import thread from '@/components/thread';
import newPostCollection from '@/components/new_post_collection';
import config from '../config';
import olMap from '../js/map';

export default {
  props: ['collection'],
  name: 'timeline',
  data() {
    return {
      startPage: 0,
      limitPage: 50,
      loading: false,
      endOfPosts: false,
      title: '',
      unfollowCollectionDialog: false,
    };
  },
  components: {
    thread, newPostCollection,
  },
  computed: {
    isMember() {
      const vuexCollections = [];
      let isMemberState = false;
      this.$store.state.privateCollections.forEach((col) => {
        vuexCollections.push(col._id); // eslint-disable-line no-underscore-dangle
      });
      this.$store.state.publicCollections.forEach((col) => {
        vuexCollections.push(col._id); // eslint-disable-line no-underscore-dangle
      });
      if (vuexCollections.includes(
        this.collection.id)) { // eslint-disable-line no-underscore-dangle
        isMemberState = true;
      } else {
        isMemberState = false;
      }
      return isMemberState;
    },
  },
  watch: {
    '$store.state.openedTimeline': function changed() {
      if (this.$store.state.openedTimeline !== this.$store.state.previousOpenedTimeline) {
        this.loadTimeline(this.$store.state.openedTimeline.id);
      }
    },
  },
  methods: {
    ...mapActions([
      'setFeature',
    ]),
    // refresh_page() {
    //   this.loading = true;
    //   const userID = this.$store.state.user._id;
    // eslint-disable-line no-underscore-dangle
    //   const url = `${config.url}/collections/collection`;
    //   axios.get(url, {
    //     params: {
    //       start: this.startPage.toString(),
    //       end: this.limitPage.toString(),
    //       userId: userID,
    //       collectionId: this.collection._id,
    //     },
    //     headers: { 'x-access-token': this.$store.state.token },
    //   }).then((response) => {
    //     response.data.forEach((d) => {
    //       // eslint-disable-next-line
    //       if (this.posts.filter(e => e._id === d._id).length === 0) {
    //         this.posts.unshift(d);
    //         this.posts.pop();
    //       }
    //     });
    //   }).then(() => {
    //     this.loading = false;
    //   });
    // },
    next_page() {
      this.loading = true;
      this.startPage += 100;
      const userID = this.$store.state.user._id; // eslint-disable-line no-underscore-dangle
      const url = `${config.url}/collections/collection`;
      axios.get(url, {
        params: {
          start: this.startPage.toString(),
          end: this.limitPage.toString(),
          userId: userID,
          collectionId: this.collection.id,
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        if (response.data.length < this.limitPage) {
          this.endOfPosts = true;
        } else {
          response.data.forEach((d) => {
            // this.posts.push(d);
            this.$store.state.commit('addPostToCollectionView', d);
          });
        }
      }).then(() => {
        this.loading = false;
      });
    },
    // toggle_new_post() {
    //   console.log('toggling collection new post');
    //   this.newPost = !this.newPost;
    //   if (this.newPost === false) {
    //     this.newPostText = this.$t('message.newPost');
    //     this.newPostColor = 'blue-grey';
    //     this.$store.commit('setActiveMapTool', 'selectFeatures');
    //   } else {
    //     this.$store.commit('setActiveMapTool', 'drawFeatures');
    //     this.newPostText = this.$t('message.cancel');
    //     this.newPostColor = 'red';
    //   }
    // },
    async loadTimeline(timelineId) {
      this.loading = true;
      let url;
      let userID;
      let collectionToOpen = '';

      if (this.$store.state.isUserLoggedIn) {
        console.log('loading specific collection');
        url = `${config.url}/collections/collection`;
        userID = this.$store.state.user._id; // eslint-disable-line no-underscore-dangle
      } else {
        console.log('user has the link so show the collection');
        url = `${config.url}/public/collection`;
        userID = '';
      }
      if (timelineId) {
        collectionToOpen = timelineId;
      } else {
        collectionToOpen = this.collection.id; // eslint-disable-line no-underscore-dangle
      }

      axios.get(url, {
        params: {
          start: this.startPage.toString(),
          end: this.limitPage.toString(),
          userId: userID, // eslint-disable-line no-underscore-dangle
          collectionId: collectionToOpen,
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        if (response.data.length < this.limitPage) {
          this.endOfPosts = true;
        }
        if (response.data.length === 0) {
          this.endOfPosts = true;
          this.loading = false;
        }
        // console.log('determine load more:: ', response.data.count, this.limitPage);
        this.$store.dispatch('setCollectionTimeline', response.data);
        // this.loading = false;
      }).then(() => {
        this.loading = false;
        const allLayers = olMap.getLayers().getArray();
        allLayers.forEach((layer) => {
          if (layer.getProperties().name === 'customLayer') {
            console.log('extent::', layer.getSource().getExtent());
            if (layer.getSource().getExtent()[0] !== 'Infinity') {
              olMap.getView().fit(layer.getSource().getExtent(), olMap.getSize());
            }
          }
        });
      });
      return true;
    },
    unfollowCollection(id) {
      console.log('id to unfollow:: ', id);
      this.unfollowCollectionDialog = false;
      const url = `${config.url}/collections/unfollow`;
      // console.log('id to delete:: ', id);
      const data = {
        memberId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        collectionId: id,
        userCreated: this.$store.state.openedTimeline.userCreated,
      };
      console.log(data);
      axios.post(url, { data }, {
        headers: { 'x-access-token': this.$store.state.token },
      }).then(() => {
        this.$store.dispatch('deletePrivateCollection', id);
        this.$store.dispatch('deletePublicCollection', id);
        this.$store.commit('removeCollectionFromTimeline', id);
        this.$eventHub.$emit('refreshprivatecollections', 'refresh');
        this.$eventHub.$emit('refreshpubliccollections', 'refresh');
        this.$socket.emit('unfollowedCollection', data);
      });
    },
    followCollection() {
      const url = `${config.url}/collections/setMembership`;
      const data = {
        memberId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        collectionsToFollow: [this.$store.state.openedTimeline.id],
        collectionsToUnfollow: [],
        userCreated: this.$store.state.openedTimeline.userCreated,
      };
      axios.post(url, { data }, {
        headers: { 'x-access-token': this.$store.state.token },
      })
      .then(() => {
        this.$socket.emit('followedCollection', data);
        this.$eventHub.$emit('refreshprivatecollections');
        this.$eventHub.$emit('refreshpubliccollections');
        // console.log('mark as followed and notify user');
      });
    },
    async clearMap() {
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach((layer) => {
        if (layer.getProperties().name === 'customLayer') {
          layer.getSource().clear();
        }
      });
      return true;
    },
  },
  mounted() {
    this.clearMap().then(() => {
      this.$store.dispatch('setCollectionTimeline', []);
      this.loadTimeline(this.collection.id).then( // eslint-disable-line no-underscore-dangle
        () => {
          this.loading = false;
          console.log('loaded');
        });
    });
    this.$eventHub.$on('openCollection', (collection) => {
      // console.log('open openCollection from notification openCollection:: ', id);
      this.loadTimeline(collection.id); // eslint-disable-line no-underscore-dangle
    });

    this.$options.sockets.newPost = (data) => {
      console.log('new post from socket', data);
      // if (this.$store.state.openedTimeline.id === ) {
      this.$store.dispatch('addPostToCollectionView', data);
      // }
    };
    this.$eventHub.$on('newPost', () => {
      if (this.$store.state.openedTimeline.id
        === this.collection.id) { // eslint-disable-line no-underscore-dangle
        // this.toggle_new_post();
      }
    });
    this.$options.sockets.youAreEditor = (data) => {
      console.log('I am added as editor', data);
      this.collection.isEditor = true;
    };
    this.$options.sockets.youAreNotEditor = (data) => {
      console.log('I am removed as editor', data);
      this.collection.isEditor = false;
    };
  },
};
</script>
<style>
#timeline {
  color: black;
  max-height: 82vh;
  overflow-y: scroll;
}
</style>
