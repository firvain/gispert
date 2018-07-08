<template>
    <v-container fluid>
      <v-btn md8 color="secondary" dark
        block
        large
        v-bind:class="[newPostColor, newPostTextColor]" @click="toggle_new_post" v-if="$store.state.isUserLoggedIn === true"
      >
        {{newPostText}}
        <v-icon right dark>insert_comment</v-icon>
      </v-btn>
      <newPost v-if="newPost===true && $store.state.isUserLoggedIn === true" :collection="id"></newPost>

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
        v-if="!endOfPosts"
        class="blue-grey white--text"
        block
      >
        {{ $t('message.loadMore')}}
        <v-icon right dark>navigate_next</v-icon>
      </v-btn>
      <span v-if="$store.state.collectionTimeline.length === 0">{{ $t('message.noPosts')}}</span>
    </v-container>
</template>
<script>
import axios from 'axios';
import { mapActions } from 'vuex';
import thread from '@/components/thread';
import newPost from './new_post';
import config from '../config';
import olMap from '../js/map';

export default {
  props: ['id'],
  name: 'timeline',
  data() {
    return {
      startPage: 0,
      limitPage: 50,
      newPost: false,
      newPostColor: 'blue-grey',
      newPostTextColor: 'white--text darken-1',
      newPostText: this.$t('message.newPostInThisCollection'),
      loading: false,
      endOfPosts: false,
    };
  },
  components: {
    thread, newPost,
  },
  watch: {
    '$store.state.openedTimeline': function changed() {
      olMap.getLayers().getArray()[1].getSource().clear();
      this.loadTimeline(this.$store.state.openedTimeline.id);
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
    //       collectionId: this.id,
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
          userId: userID, // eslint-disable-line no-underscore-dangle
          collectionId: this.id,
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
    toggle_new_post() {
      this.newPost = !this.newPost;
      if (this.newPostText === this.$t('message.cancel')) {
        this.newPostText = this.$t('message.newPost');
        this.newPostColor = 'blue-grey';
      } else {
        this.newPostText = this.$t('message.cancel');
        this.newPostColor = 'red';
      }
    },
    loadTimeline(timelineId) {
      console.log('loading collection view id::', this.id);
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
        collectionToOpen = this.id;
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
        this.$store.dispatch('setCollectionTimeline', response.data);
      }).then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loadTimeline(this.id);
    this.$eventHub.$on('openCollection', (id) => {
      console.log('open openCollection from notification openCollection:: ', id);
      this.loadTimeline(id);
    });

    this.$options.sockets.newPost = (data) => {
      console.log('new post from socket', data);
      // if (this.$store.state.openedTimeline.id === ) {
      this.$store.dispatch('addPostToCollectionView', data);
      // }
    };
    this.$eventHub.$on('newPost', () => {
      // console.log('A totally new post has been published :: ', eventPost);
      this.toggle_new_post();
      // this.$store.dispatch('addPostToCollectionView', eventPost);
    //   this.refresh_page();
    });
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
