<template>
  <v-list-tile
    ripple
    :key="notification._id"
  >
    <v-list-tile-content v-if="notification.type === 'unfollowedCollection'">
      <v-list-tile-title>{{ $t('message.collectionWasUnfollowed') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">{{ notification.collection[0].title }}</v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ notification.user[0].name }}</v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'followedCollection'">
      <v-list-tile-title>{{ $t('message.collectionWasFollowed') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">{{ notification.collection[0].title }}</v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ notification.user[0].name }}</v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'invitationAccepted'">
      <v-list-tile-title>{{ $t('message.invitationToCollectionAccepted') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">{{ notification.collection[0].title }}</v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ notification.user[0].name }}</v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'invitedToCollection'">
      <v-list-tile-title>{{ $t('message.invitedToCollection') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">{{ notification.collection[0].title }}</v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ notification.user[0].name }}</v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-action v-if="notification.type === 'unfollowedCollection' || notification.type === 'followedCollection' || notification.type === 'invitationAccepted'">
      <v-list-tile-action-text>{{ notification.action }}</v-list-tile-action-text>
      <v-btn fab small @click="notificationClicked(notification._id)" v-if="notification.read === 0">
        <v-icon v-if="notification.read === 0"
          color="orange lighten-1"
        >warning</v-icon>
      </v-btn>

      <v-icon v-if="notification.read === 1"
        color="green darken-2"
      >done</v-icon>
    </v-list-tile-action>

    <v-list-tile-action v-if="notification.type === 'invitedToCollection'">
      <v-list-tile-action-text>{{ notification.action }}</v-list-tile-action-text>
      <v-btn dark outline small color="green" @click="acceptInvitation(notification._id)">
        {{ $t("message.accept")}}
      </v-btn>
      <v-btn dark outline small color="green" @click="notificationClicked(notification._id)">
        {{ $t("message.decline")}}
      </v-btn>
    </v-list-tile-action>

  </v-list-tile>
  <!-- <v-divider v-if="index + 1 < notifications.length" :key="index"></v-divider> -->
</template>

<script>
import axios from 'axios';
import config from '../config';

export default {
  props: ['notification'],
  data() {
    return {
    };
  },
  methods: {
    notificationClicked(e) {
      console.log(e);
      this.notification.read = 1;
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/notifications/markAsRead`;
      const data = {
        id: this.notification._id, // eslint-disable-line no-underscore-dangle
      };
      axios.post(url, { data },
        {
          headers: { 'x-access-token': this.$store.state.token },
        });
    },
    invitationAccepted(e) {
      // TODO: API call to add member to collection
      console.log(e);
      this.notification.read = 1;
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/notifications/markAsRead`;
      const data = {
        id: this.notification._id, // eslint-disable-line no-underscore-dangle
      };
      axios.post(url, { data },
        {
          headers: { 'x-access-token': this.$store.state.token },
        });
    },
  },
};
</script>