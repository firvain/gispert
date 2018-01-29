<template>
  <div id='timeline'>
    <v-container fluid v-bind="{ [`grid-list-${size}`]: true }" v-if="mode === 0">
      <v-btn block color="secondary" dark
        width="50px"
        large
        v-bind:class="[newPostColor, newPostTextColor]" @click="toggle_new_post"  v-if="$store.state.isUserLoggedIn === true"
      >
        {{newPostText}}
        <v-icon right dark>insert_comment</v-icon>
      </v-btn>
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
    <v-container fluid v-else-if='mode === 1'>
      <v-btn round warning dark ripple raised large v-on:click='mode = 0'>
        <i class="fa fa-close fa-lg"> Close</i>
      </v-btn>
      <cardDetails v-bind:post="explore_estate"></cardDetails>
      <v-btn round warning dark ripple raised large v-on:click='mode = 0'>
        <i class="fa fa-close fa-lg"> Close</i>
      </v-btn>
    </v-container>
    <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i>
    <v-btn
      v-on:click='next_page'
      class="blue-grey white--text"
    >
      φορτωση περισσότερων
      <v-icon right dark>navigate_next</v-icon>
    </v-btn>
  </div>
</template>
<script>
import axios from 'axios';
import { mapGetters, mapActions } from 'vuex';
import post from './post';
import cardDetails from './card_in_details';
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
      newPostText: 'νεα αναρτηση',
      loading: false,
    };
  },
  components: {
    post, cardDetails, newPost,
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
      if (this.newPostText === 'ακυρο') {
        this.newPostText = 'νεα αναρτηση';
        this.newPostColor = 'blue-grey';
      } else {
        this.newPostText = 'ακυρο';
        this.newPostColor = 'red';
      }
    },
  },
  mounted() {
    this.loading = true;
    let url;
    if (this.$store.state.timeline.length > 0) {
      this.posts = this.$store.state.timeline;
    }
    if (this.$store.state.isUserLoggedIn) {
      url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts/all`;
    } else {
      url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/public/timeline`;
    }
    axios.get(url, {
      params: {
        start: this.startPage.toString(),
        end: this.limitPage.toString(),
        userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
      },
      headers: { 'x-access-token': this.$store.state.token },
    }).then((response) => {
      // console.log(response);
      this.posts = response.data;
    }).then(() => {
      this.loading = false;
      this.$store.dispatch('setTimeline', this.posts);
    });

    this.$on('newpost', (eventPost) => {
      console.log('A totally new post has been published :: ', eventPost);
      this.toggle_new_post();
      this.refresh_page();
    });
    this.$on('newreply', (eventPost) => {
      console.log('A new reply post has been published :: ', eventPost);
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
        console.log(eventPost);
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
