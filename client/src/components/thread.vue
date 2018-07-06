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
    <v-btn block color="white" v-if="thread.posts.length < thread.count">
      {{ $t('message.loadMore')}}
      <v-progress-circular indeterminate color="primary" v-if='loadingReplies'></v-progress-circular>
    </v-btn>
  </v-container>
</template>
<script>
import post from './post';

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
  }),
  // TODO: put methods here and load more replies
};
</script>