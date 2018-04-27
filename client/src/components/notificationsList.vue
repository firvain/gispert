<template>
  <v-container>
    <!-- {{ socketMessage }} -->
    <v-list two-line class="top"  v-if='$store.state.notifications.length > 0'>
      <notification v-for="(notification, index) in $store.state.notifications" :key='index' :notification='notification'></notification>
    </v-list>
    <v-btn
    v-on:click='next_page'
    class="blue-grey white--text"
    block
    >
      {{ $t('message.loadMore')}}
      <v-icon right dark>navigate_next</v-icon>
    </v-btn>
  </v-container>
</template>
<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import notification from './notification';
import config from '../config';

export default {
  data() {
    return {
      notifications: [],
      start: 0,
      end: 25,
      socketMessage: 'start',
    };
  },
  components: {
    notification,
  },
  computed: {
    ...mapGetters([
      'notificationsGetter',
    ]),
  },
  mounted() {
    console.log('mounting notification list');
    this.getNotifications();
    this.$options.sockets.unfollowedCollection = (data) => {
      console.log('unfollowedCollection', data);
      this.getNotifications();
      // this.socketMessage = 'unfollowedCollection';
      // this.$store.commit('addNotificationFromSocket', data);
    };
    this.$options.sockets.followedCollection = (data) => {
      console.log('followedCollection', data);
      // this.socketMessage = 'followedCollection';
      this.getNotifications();
      // this.$store.commit('addNotificationFromSocket', data);
    };
    this.$options.sockets.newReply = (data) => {
      console.log('new reply data:: ', data);
      // this.socketMessage = 'new reply data';
      this.getNotifications();
      // this.$store.commit('addNotificationFromSocket', data);
    };
    this.$options.sockets.newPost = (data) => {
      console.log('new post data:: ', data);
      // this.socketMessage = 'new post data';
      this.getNotifications();
      // this.$store.commit('addNotificationFromSocket', data);
    };
    this.$options.sockets.inviteToCollection = (data) => {
      console.log('invited to collection:: ', data);
      // this.socketMessage = 'new post data';
      this.getNotifications();
      // this.$store.commit('addNotificationFromSocket', data);
    };
  },
  methods: {
    getNotifications() {
      console.log('getting notifications');
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/notifications/user`;
      axios.get(url, {
        params: {
          id: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
          start: this.start,
          end: this.end,
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        this.$store.dispatch('setNotifications', response.data);
        this.notifications.push(response.data);
      });
    },
    next_page() {
      this.start += 25;
      this.end += 25;
      this.getNotifications();
    },
  },
};
</script>
