<template>
  <v-container ma-1 pa-1>
    <post :post="thread.posts[0]" :post-type="postType[0]"></post>
    <v-flex
      v-for="post in thread.posts.slice(1, thread.posts.length)"
      v-if="showMoreReplies"
      :key="post._id"
      md12
    >
      <post :post="post" :post-type="postType[1]"></post>
    </v-flex>
    <v-layout>
      <v-flex xs6 sm6 md6>
        <v-btn
          v-if="thread.posts.length > 1"
          block
          color="primary"
          @click="showMoreReplies = !showMoreReplies"
        >
          <span v-if="!showMoreReplies">{{ $t("message.viewReplies") }}</span>
          <span v-if="showMoreReplies">{{ $t("message.hideReplies") }}</span>
        </v-btn>
      </v-flex>
      <v-flex xs6 sm6 md6>
        <v-btn
          v-if="thread.posts.length < thread.count && showMoreReplies"
          block
          color="primary"
          @click="loadMoreReplies"
        >
          {{ $t("message.loadMore") }}
          <v-progress-circular
            v-if="loadingReplies"
            indeterminate
            color="primary"
          ></v-progress-circular>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import axios from "axios";
import post from "@/components/post";
import config from "../config";

export default {
  name: "Thread",
  components: {
    post
  },
  props: { thread: { type: Object, required: true } },
  data: () => ({
    showMoreReplies: false,
    postType: ["original", "reply"],
    loadingReplies: false,
    currentReplyIndex: 4,
    pagingStep: 10
  }),
  mounted() {
    this.$eventHub.$on("newReply", data => {
      if (this.thread._id === data.isReplyTo) {
        // eslint-disable-line no-underscore-dangle
        this.currentReplyIndex += 1;
      }
    });
    this.$options.sockets.youAreEditor = data => {
      console.log("listened to editor:: ", data);
      console.log(
        "comparing:: ",
        this.thread.posts[0].collectionData[0]._id,
        data
      ); // eslint-disable-line no-underscore-dangle
      if (data === this.thread.posts[0].collectionData[0]._id) {
        // eslint-disable-line no-underscore-dangle
        this.thread.posts[0].isEditor = true;
        this.thread.posts[0].collectionData[0].isEditor = true;
        console.log(JSON.stringify(this.thread.posts[0]));
      }
    };
    this.$options.sockets.youAreNotEditor = data => {
      if (data === this.thread.posts[0].collectionData[0]._id) {
        // eslint-disable-line no-underscore-dangle
        this.thread.posts[0].isEditor = false;
        this.thread.posts[0].collectionData[0].isEditor = false;
        console.log(JSON.stringify(this.thread.posts[0]));
      }
    };
  },
  methods: {
    loadMoreReplies() {
      // if (this.socketReplies > 0 || this.myReplies > 0) {
      //   this.replies = [];
      // }
      this.loadingReplies = true;
      // this.socketReplies = 0;
      const serverUrl = `${config.url}/posts/replies`;
      axios
        .get(serverUrl, {
          params: {
            id: this.thread._id, // eslint-disable-line no-underscore-dangle
            start: this.currentReplyIndex,
            end: this.currentReplyIndex + this.pagingStep,
            userId: this.$store.state.user._id // eslint-disable-line no-underscore-dangle
          },
          headers: { "x-access-token": this.$store.state.token }
          // }).then((response) => {
          //   this.fetchedReplies = response.data;
          //   this.fetchedReplies.forEach((r) => {
          //     this.replies.push(r);
          //   });
          //   // console.log(this.replies);
        })
        .then(response => {
          // this.loading = false;
          console.log("reply response data:: ", response.data[0]);
          this.loadingReplies = false;
          this.$store.commit("addRepliesToPost", response.data[0]);
        });
    }
  }
};
</script>
