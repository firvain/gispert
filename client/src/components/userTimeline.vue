<template>
  <v-flex md12 id='timeline'>
    <v-container md9 fluid v-bind="{ [`grid-list-${size}`]: true }" v-if="mode === 0">
      <v-btn md8 color="secondary" dark
        block
        large
        v-bind:class="[newPostColor, newPostTextColor]" @click="toggle_new_post"  v-if="$store.state.isUserLoggedIn === true"
      >
        {{newPostText}}
        <v-icon right dark>insert_comment</v-icon>
      </v-btn>
    <newPost v-if="newPost===true && $store.state.isUserLoggedIn === true" :collectionid="id"></newPost>
    <v-layout row wrap>
      <v-flex
        md12
        v-for="post in posts"
        :key="post._id"
      >
        <post :post='post'></post>
      </v-flex>
    </v-layout>
    </v-container>
    <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
    <v-btn
      v-if="$store.state.timeline.length > 0"
      v-on:click='next_page'
      class="blue-grey white--text"
      block
    >
      {{ $t('message.loadMore')}}
      <v-icon right dark>navigate_next</v-icon>
    </v-btn>
    <span v-if="$store.state.timeline.length === 0">{{ $t('message.noPosts')}}</span>
  </v-flex>
</template>
<script>
import axios from 'axios';
import { mapGetters, mapActions } from 'vuex';
import post from './post';
import newPost from './new_post';
import config from '../config';

export default {
  props: ['id'],
  name: 'timeline',
  data() {
    return {
      posts: [],
      size: 'md',
      expand: 'md12',
      mode: 0,
      explore_estate: null,
      startPage: 0,
      limitPage: 25,
      newPost: false,
      newPostColor: 'blue-grey',
      newPostTextColor: 'white--text darken-1',
      newPostText: this.$t('message.newPostInThisCollection'),
      loading: false,
    };
  },
  components: {
    post, newPost,
  },
  watch: {
    '$store.state.openedTimeline': function changed() {
      this.loadTimeline(this.$store.state.openedTimeline.id);
    },
  },
  computed: mapGetters([
    'evenOrOdd',
    'feature',
  ]),
  methods: {
    ...mapActions([
      'setFeature',
      'increment',
      'decrement',
      'incrementIfOdd',
      'incrementAsync',
    ]),
    refresh_page() {
      //  TODO: do the correct API call
      // console.log('refreshing page');
      this.loading = true;
      const userID = this.id; // eslint-disable-line no-underscore-dangle
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts/person`;
      axios.get(url, {
        params: {
          start: this.startPage.toString(),
          end: this.limitPage.toString(),
          userId: userID,
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        response.data.forEach((d) => {
          // eslint-disable-next-line
          if (this.posts.filter(e => e._id === d._id).length === 0) {
            this.posts.unshift(d);
            this.posts.pop();
          }
        });
      }).then(() => {
        this.loading = false;
      });
    },
    next_page() {
      //  TODO: do the correct API call
      this.loading = true;
      this.startPage += 25;
      const userID = this.id; // eslint-disable-line no-underscore-dangle
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts/person`;
      axios.get(url, {
        params: {
          start: this.startPage.toString(),
          end: this.limitPage.toString(),
          userId: userID, // eslint-disable-line no-underscore-dangle
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        response.data.forEach((d) => {
          this.posts.push(d);
        });
      }).then(() => {
        this.loading = false;
      });
    },
    toggle_new_post() {
      this.newPost = !this.newPost;
      if (this.newPostText === this.$t('message.cancel')) {
        this.newPostText = this.$t('message.newPostInThisCollection');
        this.newPostColor = 'blue-grey';
      } else {
        this.newPostText = this.$t('message.cancel');
        this.newPostColor = 'red';
      }
    },
    loadTimeline(timelineId) {
      this.loading = true;
      let url;
      let userID;

      if (this.$store.state.isUserLoggedIn) {
        url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts/person`;
        if (timelineId) {
          userID = timelineId;
        } else {
          userID = this.id; // eslint-disable-line no-underscore-dangle
        }
      }

      axios.get(url, {
        params: {
          start: this.startPage.toString(),
          end: this.limitPage.toString(),
          userId: userID, // eslint-disable-line no-underscore-dangle
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        // console.log(response);
        this.posts = response.data;
      }).then(() => {
        this.loading = false;
        this.$store.dispatch('setUserTimeline', this.posts);
      });
    },
  },
  mounted() {
    this.loadTimeline(this.id);

    this.$eventHub.$on('openTimeline', (id) => {
      console.log('open timeline from notification usertimelinevue:: ', id);
      this.loadTimeline(id);
    });

    this.$options.sockets.newPost = (data) => {
      console.log('new post from socket', data);
      this.$store.dispatch('addPostToUserTimeline', data);
    };
    this.$on('newpost', (eventPost) => {
      console.log('A totally new post has been published :: ', eventPost);
      this.toggle_new_post();
      this.$store.dispatch('addPostToUserTimeline', eventPost);
    //   this.refresh_page();
    });
  },
};
</script>
<style>
#timeline {
  color: black;
  max-height: 82vh;
  width: 100vh;
  overflow-y: scroll;
}
</style>
