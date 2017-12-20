<template>
  <div id='timeline'>
    <v-container fluid v-bind="{ [`grid-list-${size}`]: true }" v-if="mode === 0">
      <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i>
      <v-btn
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
    next_page() {
      this.loading = true;
      this.startPage += 25;
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts/all?start=${this.startPage.toString()}&end=${this.limitPage.toString()}`;
      axios.get(url).then((response) => {
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
    const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts/all?start=${this.startPage.toString()}&end=${this.limitPage.toString()}`;
    axios.get(url).then((response) => {
      this.posts = response.data;
    }).then(() => {
      this.loading = false;
    });
    this.$on('newpost', () => {
      console.log('newpost');
      this.toggle_new_post();
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
