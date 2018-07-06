<template>
  <v-container ma-1 pa-1>
    <post :post='thread.posts[0]' :postType='postType[0]'></post>
    <v-flex
      md12
      v-if="showMoreReplies"
      v-for="post in thread.posts.slice(1, thread.posts.length)"
      :key="post._id"
    >
      <post :post='post' :postType='postType[1]'></post>
    </v-flex>
    <v-btn block color="white" v-if="thread.posts.length > 1" @click="showMoreReplies = !showMoreReplies">
      {{ $t('message.viewReplies')}}
      <!-- <v-progress-circular indeterminate color="primary"></v-progress-circular> -->
    </v-btn>
    <v-btn block color="white" v-if="thread.posts.length < thread.count" @click='loadMoreReplies'>
      {{ $t('message.loadMore')}}
      <v-progress-circular indeterminate color="primary" v-if='loadingReplies'></v-progress-circular>
    </v-btn>
  </v-container>
</template>
<script>
import axios from 'axios';
import post from '@/components/post';
import config from '../config';

export default {
  props: ['thread'],
  name: 'thread',
  components: {
    post,
  },
  data: () => ({
    showMoreReplies: false,
    postType: ['original', 'reply'],
    loadingReplies: false,
    currentReplyIndex: 4,
    pagingStep: 10,
  }),
  methods: {
    loadMoreReplies() {
      // if (this.socketReplies > 0 || this.myReplies > 0) {
      //   this.replies = [];
      // }
      this.loadingReplies = true;
      // this.socketReplies = 0;
      const serverUrl = `${config.url}/posts/replies`;
      axios.get(serverUrl, { params: {
        id: this.thread._id, // eslint-disable-line no-underscore-dangle
        start: this.currentReplyIndex,
        end: this.currentReplyIndex + this.pagingStep,
        userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
      },
        headers: { 'x-access-token': this.$store.state.token },
      // }).then((response) => {
      //   this.fetchedReplies = response.data;
      //   this.fetchedReplies.forEach((r) => {
      //     this.replies.push(r);
      //   });
      //   // console.log(this.replies);
      }).then((response) => {
        // this.loading = false;
        console.log('reply response data:: ', response.data[0]);
        this.loadingReplies = false;
        this.$store.commit('addReplyToPost', response.data[0]);
      });
    },
  },
};
</script>
