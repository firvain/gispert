<template>
  <v-container
    v-if="mode === 0"
    id="timeline"
    fluid
    v-bind="{ [`grid-list-${size}`]: true }"
  >
    <newPost v-if="$store.state.isUserLoggedIn === true"></newPost>
    <v-flex v-for="thread in $store.state.timeline" :key="thread._id" md12>
      <thread :thread="thread"></thread>
    </v-flex>
    <v-progress-linear
      v-show="loading"
      :indeterminate="true"
    ></v-progress-linear>
    <v-btn
      v-if="!endOfPosts && $store.state.isUserLoggedIn"
      block
      @click="next_page"
    >
      {{ $t("message.loadMore") }}
      <v-icon right dark>navigate_next</v-icon>
    </v-btn>
  </v-container>
</template>
<script>
import axios from "axios";
import thread from "@/components/thread";
// import post from './post';
import newPost from "./new_post";
import config from "../config";

export default {
  name: "Timeline",
  components: {
    newPost,
    thread
  },
  data() {
    return {
      posts: [],
      size: "md",
      expand: "md12",
      mode: 0,
      explore_estate: null,
      startPage: 0,
      limitPage: 50,
      loading: false,
      endOfPosts: false
    };
  },
  watch: {
    "$store.state.isUserLoggedIn": function locale() {
      this.newPostText = this.$t("message.newPost");
    }
  },
  mounted() {
    if (this.$store.state.timeline === []) {
      this.load_first_page();
    }
    // else {
    //   this.posts = this.$store.state.timeline;
    // }
    this.$eventHub.$on("logged-in", () => {
      this.$store.dispatch("setTimeline", []);
      this.load_first_page();
    });
    this.$eventHub.$on("refreshTimeline", () => {
      this.$store.dispatch("setTimeline", []);
      this.load_first_page();
    });
    // this.$eventHub.$on('newPost', () => {
    // this.replies.unshift(data);
    // this.toggle_new_post();
    // });
  },
  methods: {
    // refresh_page() {
    //   // console.log('refreshing page');
    //   this.loading = true;
    //   const url = `${config.url}/posts/all?start=
    // ${this.startPage.toString()}&end=${this.limitPage.toString()}`;
    //   axios.get(url, {
    //     headers: { 'x-access-token': this.$store.state.token },
    //   }).then((response) => {
    //     response.data.forEach((d) => {
    //       // eslint-disable-next-line
    //       if (this.posts.filter(e => e._id === d._id).length === 0) {
    //         this.posts.unshift(d);
    //         this.posts.pop();
    //       }
    //     });
    //     if (response.data.length < this.limitPage) {
    //       this.endOfPosts = true;
    //     }
    //   }).then(() => {
    //     this.loading = false;
    //   });
    // },
    next_page() {
      this.loading = true;
      this.startPage += 50;
      const url = `${
        config.url
      }/posts/all?start=${this.startPage.toString()}&end=${this.limitPage.toString()}`;
      axios
        .get(url, {
          headers: { "x-access-token": this.$store.state.token }
        })
        .then(response => {
          if (response.data.length < this.limitPage) {
            this.endOfPosts = true;
          }
          response.data.forEach(d => {
            this.posts.push(d);
          });
        })
        .then(() => {
          this.loading = false;
        });
    },
    load_first_page() {
      this.loading = true;
      let url;
      let userID;
      // if (this.$store.state.timeline.length > 0) {
      //   this.posts = this.$store.state.timeline;
      // }
      if (this.$store.state.isUserLoggedIn) {
        url = `${config.url}/posts/all`;
        userID = this.$store.state.user._id; // eslint-disable-line no-underscore-dangle
      } else {
        url = `${config.url}/public/timeline`;
        userID = "";
      }
      axios
        .get(url, {
          params: {
            start: this.startPage.toString(),
            end: this.limitPage.toString(),
            userId: userID // eslint-disable-line no-underscore-dangle
          },
          headers: { "x-access-token": this.$store.state.token }
        })
        .then(response => {
          console.log("posts fetched are:: ", response.data.length);
          if (response.data.length < this.limitPage) {
            this.endOfPosts = true;
          }
          this.posts = response.data;
        })
        .then(() => {
          this.loading = false;
          this.$store.dispatch("setTimeline", this.posts);
        });
    }
  }
};
</script>
<style>
#timeline {
  color: black;
  max-height: 82vh;
  overflow-y: scroll;
}
</style>
