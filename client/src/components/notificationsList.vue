<template>
  <v-container>
    <!-- {{ socketMessage }} -->
    <v-card>
      <v-tooltip bottom>
        <v-btn slot="activator" text icon outline color="indigo">
          <v-icon>check</v-icon>
        </v-btn>
        <span>{{ $t("message.markAllAsRead") }}</span>
      </v-tooltip>
      <span class="headline">{{ $t("message.notifications") }}</span>
      <v-list v-if="$store.state.notifications.length > 0" two-line class="top">
        <notification
          v-for="(notification, index) in $store.state.notifications"
          :key="index"
          :notification="notification"
        ></notification>
      </v-list>
    </v-card>
    <v-card v-if="$store.state.notifications.length === 0">
      <v-card-title>
        There are no notifications
      </v-card-title>
    </v-card>

    <v-btn
      v-if="$store.state.notifications.length > 0"
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
import { mapGetters } from "vuex";
// import ol from 'openlayers';
import notification from "./notification";
import config from "../config";
// import olMap from '../js/map';
// import styles from '../js/styles';

export default {
  components: {
    notification
  },
  data() {
    return {
      notifications: [],
      start: 0,
      end: 25,
      socketMessage: "start"
    };
  },
  computed: {
    ...mapGetters(["notificationsGetter"])
  },
  watch: {},
  mounted() {
    console.log("mounting notification list");
    this.getNotifications();
    this.$options.sockets.unfollowedCollection = data => {
      console.log("unfollowedCollection:: ", data);
      this.getNotifications();
      // this.socketMessage = 'unfollowedCollection';
      // this.$store.commit('addNotificationFromSocket', data);
    };
    this.$options.sockets.followedCollection = data => {
      console.log("followedCollection:: ", data);
      // this.socketMessage = 'followedCollection';
      this.getNotifications();
      // this.$store.commit('addNotificationFromSocket', data);
    };
    this.$options.sockets.newReply = data => {
      console.log("new reply data:: ", data);
      // this.socketMessage = 'new reply data';
      this.getNotifications();
      // this.$store.commit('addNotificationFromSocket', data);
    };
    this.$options.sockets.newPost = data => {
      console.log("new post data:: ", JSON.stringify(data));
      // this.socketMessage = 'new post data';
      this.getNotifications();
      this.$store.dispatch("addPostToTimeline", data);
      // this.$store.commit('addNotificationFromSocket', data);
    };
    this.$options.sockets.inviteToCollection = data => {
      console.log("invited to collection:: ", data);
      // this.socketMessage = 'new post data';
      this.getNotifications();
      // this.$store.commit('addNotificationFromSocket', data);
    };
    this.$options.sockets.invitationForFeatureChat = data => {
      console.log("invited to chat:: ", data);
      const n = {
        byUser: data.sender,
        read: 0,
        type: "invitedToFeatureChat",
        feature: data.feature,
        timestamp: data.timestamp,
        senderName: data.senderName,
        featureId: data.id
      };
      this.$store.dispatch("addNotificationFromSocket", n);
    };
    this.$eventHub.$on("refreshNotifications", () => {
      this.getNotifications();
    });
  },
  methods: {
    getNotifications() {
      console.log("getting notifications");
      const url = `${config.url}/notifications/user`;
      axios
        .get(url, {
          params: {
            id: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
            start: this.start,
            end: this.end,
            lastLogin: this.$store.state.user.lastLogin
          },
          headers: { "x-access-token": this.$store.state.token }
        })
        .then(response => {
          this.$store.dispatch("setNotifications", response.data);
          this.notifications.push(response.data);
        });
    },
    next_page() {
      this.start += 25;
      this.end += 25;
      this.getNotifications();
    }
  }
};
</script>
