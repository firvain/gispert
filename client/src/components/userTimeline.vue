<template>
  <v-container fluid>
    <v-layout v-if="$store.state.userTimeline.length > 0" row wrap>
      <v-flex
        v-for="thread in $store.state.userTimeline"
        :key="thread._id"
        md12
      >
        <thread :thread="thread"></thread>
      </v-flex>
      <v-progress-linear
        v-show="loading"
        :indeterminate="true"
      ></v-progress-linear>
      <v-btn
        v-if="!endOfPosts && $store.state.userTimeline.length !== 0"
        block
        @click="next_page"
      >
        {{ $t("message.loadMore") }}
        <v-icon right dark>navigate_next</v-icon>
      </v-btn>

      <!-- <v-flex
          md12
          v-for="post in posts"
          :key="post._id"
        >
          <post :post='post'></post>
        </v-flex> -->
    </v-layout>
    <!-- <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
      <v-btn
        v-if="$store.state.userTimeline.length > 0 && endOfPosts === false"
        v-on:click='next_page'
        block
      >
        {{ $t('message.loadMore')}}
        <v-icon right dark>navigate_next</v-icon>
      </v-btn> -->
    <span v-if="$store.state.userTimeline.length === 0">{{
      $t("message.noPosts")
    }}</span>
  </v-container>
</template>
<script>
import axios from "axios";
import thread from "@/components/thread";
// import newPost from '@/components/new_post';
import config from "../config";
import olMap from "../js/map";

export default {
  name: "Timeline",
  components: {
    thread
  },
  props: ["id"],
  data() {
    return {
      explore_estate: null,
      startPage: 0,
      limitPage: 25,
      loading: false,
      endOfPosts: false
    };
  },
  watch: {
    "$store.state.openedTimeline": function changed() {
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach(layer => {
        if (layer.getProperties().name === "customLayer") {
          layer.getSource().clear();
        }
      });
      this.loadTimeline(this.$store.state.openedTimeline.id);
    }
  },
  mounted() {
    this.loadTimeline(this.id);

    this.$eventHub.$on("openTimeline", id => {
      console.log("open timeline from notification usertimelinevue:: ", id);
      this.loadTimeline(id);
    });

    this.$options.sockets.newPost = data => {
      console.log("new post from socket", data);
      this.$store.dispatch("addPostToUserTimeline", data);
    };
  },
  methods: {
    // refresh_page() {
    //   // console.log('refreshing page');
    //   this.loading = true;
    //   const userID = this.id; // eslint-disable-line no-underscore-dangle
    //   const url = `${config.url}/posts/person`;
    //   axios.get(url, {
    //     params: {
    //       start: this.startPage.toString(),
    //       end: this.limitPage.toString(),
    //       userId: userID,
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
      this.startPage += this.limitPage;
      const userID = this.id; // eslint-disable-line no-underscore-dangle
      console.log(userID, this.$store.state.user._id); // eslint-disable-line no-underscore-dangle
      const url = `${config.url}/posts/person`;
      axios
        .get(url, {
          params: {
            start: this.startPage.toString(),
            end: this.limitPage.toString(),
            userIdTl: userID,
            userIdCl: this.$store.state.user._id // eslint-disable-line no-underscore-dangle
          },
          headers: { "x-access-token": this.$store.state.token }
        })
        .then(response => {
          if (response.data.length < this.limitPage) {
            this.endOfPosts = true;
          }
          if (response.data.length > 0) {
            response.data.forEach(d => {
              // this.posts.push(d);
              this.$store.state.commit("addPostToUserTimeline", d);
            });
          }
        })
        .then(() => {
          this.loading = false;
        });
    },
    loadTimeline(timelineId) {
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach(layer => {
        if (layer.getProperties().name === "customLayer") {
          layer.getSource().clear();
        }
      });

      this.loading = true;
      let url;
      let userID;
      if (this.$store.state.isUserLoggedIn) {
        console.log("loading timeline");
        url = `${config.url}/posts/person`;
        if (timelineId) {
          userID = timelineId;
        } else {
          userID = this.id; // eslint-disable-line no-underscore-dangle
        }
      }
      axios
        .get(url, {
          params: {
            start: this.startPage.toString(),
            end: this.limitPage.toString(),
            userIdTl: userID,
            userIdCl: this.$store.state.user._id // eslint-disable-line no-underscore-dangle
          },
          headers: { "x-access-token": this.$store.state.token }
        })
        .then(response => {
          if (response.data.length < this.limitPage) {
            this.endOfPosts = true;
          }
          this.$store.dispatch("setUserTimeline", response.data);
        })
        .then(() => {
          this.loading = false;
        });
    }
  }
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
