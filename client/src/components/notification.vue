<template>
  <v-list-tile
    ripple
    @click="notificationClicked(notification._id)"
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
    <v-list-tile-action>
      <v-list-tile-action-text>{{ notification.action }}</v-list-tile-action-text>
      <v-icon v-if="notification.read === 0"
        color="grey lighten-1"
      >check_box_outline_blank</v-icon>
      <v-icon v-if="notification.read === 1"
        color="green darken-2"
      >check_box</v-icon>
    </v-list-tile-action>
  </v-list-tile>
  <!-- <v-divider v-if="index + 1 < notifications.length" :key="index"></v-divider> -->
</template>

<script>
  export default {
    props: ['notification'],
    data() {
      return {
      };
    },
  };
</script>