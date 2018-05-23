<template>
  <div id='timeline'>
    <v-container fluid v-bind="{ [`grid-list-${size}`]: true }" v-if="mode === 0">
    <v-tooltip bottom>
      <v-btn slot="activator" block color="secondary" dark
        width="50px"
        large
        v-bind:class="[newPostColor, newPostTextColor]" @click="toggle_new_post"  v-if="$store.state.isUserLoggedIn === true"
      >
        {{newPostText}}
        <v-icon right dark>insert_comment</v-icon>
      </v-btn>
      <span>{{ $t('message.newPostHint')}}!!!</span>
    </v-tooltip>
    <newPost v-if="newPost===true && $store.state.isUserLoggedIn === true"></newPost>
    <v-layout row wrap>
      <v-flex
        md12
        v-for="post in posts"
        :key="post._id"
      >
        <post :post='post' @explore="explore"></post>
      </v-flex>
    </v-layout>
    </v-container>
    <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
    <v-btn
      v-on:click='next_page'
      class="blue-grey white--text"
      block
    >
      {{ $t('message.loadMore')}}
      <v-icon right dark>navigate_next</v-icon>
    </v-btn>
  </div>
</template>
<script>
import axios from 'axios';
import post from './post';
import newPost from './new_post';
import config from '../config';

export default {
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
      newPostText: this.$t('message.newPost'),
      loading: false,
    };
  },
  components: {
    post, newPost,
  },
  methods: {
    explore(estate) {
      this.mode = 1;
      this.explore_estate = estate;
      return estate;
    },
    refresh_page() {
      // console.log('refreshing page');
      this.loading = true;
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts/all?start=${this.startPage.toString()}&end=${this.limitPage.toString()}`;
      axios.get(url, {
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
      this.loading = true;
      this.startPage += 25;
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts/all?start=${this.startPage.toString()}&end=${this.limitPage.toString()}`;
      axios.get(url, {
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
        this.newPostText = this.$t('message.newPost');
        this.newPostColor = 'blue-grey';
      } else {
        this.newPostText = this.$t('message.cancel');
        this.newPostColor = 'red';
      }
    },
    load_first_page() {
      this.loading = true;
      let url;
      let userID;
      if (this.$store.state.timeline.length > 0) {
        this.posts = this.$store.state.timeline;
      }
      if (this.$store.state.isUserLoggedIn) {
        url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts/all`;
        userID = this.$store.state.user._id; // eslint-disable-line no-underscore-dangle
      } else {
        url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/public/timeline`;
        userID = '';
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
        this.$store.dispatch('setTimeline', this.posts);
      });
    },
  },
  mounted() {
    if (this.$store.state.timeline.length === 0) {
      this.load_first_page();
    } else {
      this.posts = this.$store.state.timeline;
    }

    this.$options.sockets.newPost = (data) => {
      console.log('new post from socket', JSON.stringify(data));
      this.$store.dispatch('addPostToTimeline', data);
    };
    this.$on('newpost', (eventPost) => {
      console.log('A totally new post has been published :: ', JSON.stringify(eventPost));
      this.toggle_new_post();
      this.$store.dispatch('addPostToTimeline', eventPost);
    //   this.refresh_page();
    });
    this.$on('newreply', (eventPost) => {
      console.log('A new reply has been published :: ', eventPost);
      this.$store.dispatch('addReplyToPost', eventPost);
    //   this.refresh_page();
    });
    // this.$on('newreply', (eventPost) => {
    //   console.log('A new reply post has been published :: ', eventPost);
      // TODO χρειάζομαι το id του post και να ενημερώνω το posts array
      // αν έχει πολλές απαντήσεις; κάποιες να τις δείχνει περιληπτικά. μέχρι 5
      // να τις δείχνει αν είναι περισσότερες
      // να δείχνει τις 2 πιο πρόσφατες και τις άλλες με Load more. Αν πατήσει
      // κουμπί να τις δείχνει όλες. Να λέει
      // πόσες είναι που θα δείξει.
      // επίσης πρέπει να φορτώνει τα post με ταξινόμηση ως προς την πιο πρόσφατη απάντηση.
      // σύστημα notifications?
      // πόσα post να φέρνει ανά σελίδα; αν έχει πολλές απαντήσεις θα φαίνονται πολύ
      // λίγα. Πρέπει να το ρυθμίζω.
        // eslint-disable-next-line
    //     console.log(eventPost);
    // });
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
