<template>
  <v-list two-line class="top"  v-if='$store.state.notifications.length > 0'>
    <notification v-for="(notification, index) in $store.state.notifications" :key='index' :notification='notification'></notification>
  </v-list>
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
    console.log('mounting list');
    this.getNotifications();
    this.$options.sockets.unfollowedCollection = (data) => {
      console.log('unfollowedCollection', data);
      this.getNotifications();
      // this.$store.commit('addNotificationFromSocket', data);
    };
    this.$options.sockets.followedCollection = (data) => {
      console.log('followedCollection', data);
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
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        this.$store.dispatch('setNotifications', response.data);
        this.notifications = response.data;
      });
    },
  },
};
</script>
