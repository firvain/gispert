<template>
<v-container pa-0>
  <v-list-tile
    ripple
    :key="notification._id"
  >
    <v-list-tile-content v-if="notification.type === 'followedCollection'">
      <v-list-tile-title>{{ $t('message.collectionWasFollowed') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">
        <a md12 @click="loadPosts(notification.collection[0]._id)">{{ notification.collection[0].title }}</a>
      </v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ $t('message.byUser') }}: 
        <a md12 @click="loadPosts(notification.user[0]._id)">@{{ notification.user[0].name }}</a>,
        &nbsp; <i>{{ timestamp }}</i>
      </v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'unfollowedCollection'">
      <v-list-tile-title>{{ $t('message.collectionWasUnfollowed') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">
        <a md12 @click="loadPosts(notification.collection[0]._id)">{{ notification.collection[0].title }}</a>
      </v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ $t('message.byUser') }}: 
        <a md12 @click="loadPosts(notification.user[0]._id)">@{{ notification.user[0].name }}</a>,
        &nbsp; <i>{{ timestamp }}</i>
      </v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'invitedToCollection'">
      <v-list-tile-title>{{ $t('message.invitedToCollection') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">
        <a md12 @click="loadPosts(notification.collection[0]._id)">{{ notification.collection[0].title }}</a>
      </v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ $t('message.byUser') }}: 
        <a md12 @click="loadPosts(notification.user[0]._id)">@{{ notification.user[0].name }}</a>,
        &nbsp; <i>{{ timestamp }}</i>
      </v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'invitationAccepted'">
      <v-list-tile-title>{{ $t('message.invitationToCollectionAccepted') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">
        <a md12 @click="loadPosts(notification.collection[0]._id)">{{ notification.collection[0].title }}</a>
      </v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ $t('message.byUser') }}: 
        <a md12 @click="loadPosts(notification.user[0]._id)">@{{ notification.user[0].name }}</a>,
        &nbsp; <i>{{ timestamp }}</i>
      </v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'newPostInCollection'">
      <v-list-tile-title>{{ $t('message.newPostInThisCollection') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">
        <a md12 @click="loadPosts(notification.collection[0]._id)">{{ notification.collection[0].title }}</a>
        <i><a md12 @click="loadFeatures(notification.features)">{{ notification.text }}</a></i>
      </v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ $t('message.byUser') }}: 
        <a md12 @click="loadPosts(notification.collection[0]._id)">@{{ notification.user[0].name }}</a>,
        &nbsp; <i>{{ timestamp }}</i>
      </v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'replyToMyPost'">
      <!-- <v-list-tile-title>{{ $t('message.aReplyToYourPostPublished') }}</v-list-tile-title> -->
      <!-- {{$store.state.user._id}}, {{ notification.collection[0].user }} -->
      <v-list-tile-title v-if="notification.collection[0].user === $store.state.user._id">{{ $t('message.aReplyToYourPostPublished') }}</v-list-tile-title>
      <v-list-tile-title v-else>{{ $t('message.newPostInThisCollection') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">
        <a md12 @click="loadPosts(notification.collection[0]._id)">{{ notification.collection[0].title }}</a>
        , <a md12 @click="loadFeatures(notification.features)">{{ notification.text }}</a>
      </v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ $t('message.byUser') }}: 
        <a md12 @click="loadPosts(notification.user[0]._id)">@{{ notification.user[0].name }}</a>,
        &nbsp; <i>{{ timestamp }}</i>
      </v-list-tile-sub-title>
    </v-list-tile-content>


    <v-list-tile-action 
        v-if="notification.type === 'unfollowedCollection' ||
        notification.type === 'followedCollection' ||
        notification.type === 'invitationAccepted'">
      <v-list-tile-action-text>{{ notification.action }}</v-list-tile-action-text>
      <v-btn fab small @click="markAsRead(notification._id)" v-if="notification.read === 0">
        <v-icon v-if="notification.read === 0"
          color="orange lighten-1"
        >warning</v-icon>
      </v-btn>
      <v-icon v-if="notification.read === 1"
        color="green darken-2"
      >done</v-icon>
    </v-list-tile-action>

    <v-list-tile-action v-if="notification.type === 'invitedToCollection'">
      <v-list-tile-action-text>{{ notification.action }} {{ notification.collectionId }}</v-list-tile-action-text>
      <v-btn dark outline small color="green" @click="invitationAccepted(notification.collectionId)" v-if="notification.read === 0">
        {{ $t("message.accept")}}
      </v-btn>
      <v-btn dark outline small color="grey" @click="invitationDeclined(notification.collectionId)" v-if="notification.read === 0">
        {{ $t("message.decline")}}
      </v-btn>
      <v-icon v-if="notification.read === 1"
        color="green darken-2"
      >done</v-icon>
    </v-list-tile-action>
  <!-- <v-divider v-if="index + 1 < notifications.length" :key="index"></v-divider> -->

  </v-list-tile>
  <v-divider md12></v-divider>
</v-container>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import config from '../config';

export default {
  props: ['notification'],
  data() {
    return {
    };
  },
  methods: {
    loadPosts(e) {
      console.log('load users tl::', e);
    },
    loadFeatures(e) {
      console.log('load features', e);
    },
    markAsRead() {
      this.notification.read = 1;
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/notifications/markAsRead`;
      const data = {
        id: this.notification._id, // eslint-disable-line no-underscore-dangle
      };
      axios.post(url, { data },
        {
          headers: { 'x-access-token': this.$store.state.token },
        }).then(() => {
          this.$eventHub.$emit('refreshNotifications', 'refreshNotifications');
        });
    },
    invitationDeclined(e) {
      console.log('declined this invitation:: ', e);
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
    invitationAccepted(collectionId) {
      // TODO: API call to add member to collection
      console.log(collectionId);
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections/addMember`;
      const data = {
        memberId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        collectionsId:
          [collectionId], // eslint-disable-line no-underscore-dangle
        userCreated: this.notification.user[0]._id, // eslint-disable-line no-underscore-dangle
      };
      console.log(data);
      axios.post(url, { data },
        {
          headers: { 'x-access-token': this.$store.state.token },
        }).then(() => {
          this.notification.read = 1;
          this.$socket.emit('followedCollection', data);
        }).then(() => {
          this.markAsRead();
          this.$eventHub.$emit('refreshpubliccollections', data);
          this.$eventHub.$emit('refreshprivatecollections', data);
        });
    },
  },
  computed: {
    timestamp() {
      return moment(parseInt(this.notification.timestamp, 0)).format('lll');
    },
  },
};
</script>
<style>
  a {
    cursor: pointer;
  }
</style>
