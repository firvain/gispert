<template>
  <v-flex>
    <v-card class="message" :color="message.userId !== $store.state.user._id ? 'white' : 'blue' ">
      <div :class="message.userId !== $store.state.user._id ? 'black--text' : 'white--text' ">
        {{ message.userName }}: 
        <span class='content'>{{message.content}}</span>
        <p class="date">{{moment(message.date).format('h:mm:ss a, DD-MM-YYYY')}}</p>
      </div>
    </v-card>
  </v-flex>
</template>
<script>
export default {
  name: 'chat',
  props: ['message'],
};
</script>
<style lang="scss">
  .date {
    font-size: 0.8em !important;
  }
  // .content {
  //   word-wrap: break-word;
  // }
  .message {
    word-wrap: break-word;
    font-size: 2em;
    padding: 2px;
    margin: 2px;
  }
</style>