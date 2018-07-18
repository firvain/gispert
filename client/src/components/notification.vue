<template>
<v-container pa-0>
  <v-list-tile
    ripple
    :key="notification._id"
  >
    <v-list-tile-content v-if="notification.type === 'followedCollection'">
      <v-list-tile-title>{{ $t('message.collectionWasFollowed') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">
        <a md12 @click="loadCollection(notification.collection[0])">{{ notification.collection[0].title }}</a>
      </v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ $t('message.byUser') }}:
        <a md12 @click="loadUsersTl(notification.user[0]._id)">@{{ notification.user[0].name }}</a>,
        &nbsp; <i>{{ timestamp }}</i>
      </v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'unfollowedCollection'">
      <v-list-tile-title>{{ $t('message.collectionWasUnfollowed') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">
        <a md12 @click="loadCollection(notification.collection[0])">{{ notification.collection[0].title }}</a>
      </v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ $t('message.byUser') }}:
        <a md12 @click="loadUsersTl(notification.user[0]._id)">@{{ notification.user[0].name }}</a>,
        &nbsp; <i>{{ timestamp }}</i>
      </v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'invitedToCollection'">
      <v-list-tile-title>{{ $t('message.invitedToCollection') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">
        <a md12 @click="loadCollection(notification.collection[0])">{{ notification.collection[0].title }}</a>
      </v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ $t('message.byUser') }}:
        <a md12 @click="loadUsersTl(notification.user[0]._id)">@{{ notification.user[0].name }}</a>,
        &nbsp; <i>{{ timestamp }}</i>
      </v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'invitationAccepted'">
      <v-list-tile-title>{{ $t('message.invitationToCollectionAccepted') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">
        <a md12 @click="loadCollection(notification.collection[0])">{{ notification.collection[0].title }}</a>
      </v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ $t('message.byUser') }}:
        <a md12 @click="loadUsersTl(notification.user[0]._id)">@{{ notification.user[0].name }}</a>,
        &nbsp; <i>{{ timestamp }}</i>
      </v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'newPostInCollection'">
      <v-list-tile-title>{{ $t('message.newPostInThisCollection') }}</v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">
        <a md12 @click="loadCollection(notification.collection[0])">{{ notification.collection[0].title }}</a>
        <i><a md12 @click="loadFeatures(notification.features)">{{ notification.text }}</a></i>
      </v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ $t('message.byUser') }}:
        <a md12 @click="loadUsersTl(notification.user[0]._id)">@{{ notification.user[0].name }}</a>,
        &nbsp; <i>{{ timestamp }}</i>
      </v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'replyToMyPost'">
      <!-- <v-list-tile-title>{{ $t('message.aReplyToYourPostPublished') }}</v-list-tile-title> -->
      <!-- {{$store.state.user._id}}, {{ notification.collection[0].user }} -->
      <v-list-tile-title v-if="notification.userCreated === $store.state.user._id">{{ $t('message.aReplyToYourPostPublished') }}
      </v-list-tile-title>
      <v-list-tile-title v-else>{{ $t('message.newPostInThisCollection') }}
      </v-list-tile-title>
      <v-list-tile-sub-title class="text--primary">
        <a md12 @click="loadCollection(notification.collection[0])">{{ notification.collection[0].title }}</a>
        , <a md12 @click="loadFeatures(notification.features)">{{ notification.text }}</a>
      </v-list-tile-sub-title>
      <v-list-tile-sub-title>{{ $t('message.byUser') }}:
        <a md12 @click="loadUsersTl(notification.user[0]._id)">@{{ notification.user[0].name }}</a>,
        &nbsp; <i>{{ timestamp }}</i>
      </v-list-tile-sub-title>
    </v-list-tile-content>

    <v-list-tile-content v-if="notification.type === 'invitedToFeatureChat'">
      <v-list-tile-title>invited to chat</v-list-tile-title>
      <v-list-tile-sub-title>{{ $t('message.byUser') }}:
        <a md12 @click="loadUsersTl(notification.byUser)">@{{ notification.senderName }}</a>,
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
      <v-list-tile-action-text>{{ notification.action }}</v-list-tile-action-text>
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

    <v-list-tile-action v-if="notification.type === 'invitedToFeatureChat'">
      <v-list-tile-action-text>{{ notification.action }}</v-list-tile-action-text>
      <v-btn dark outline small color="green"
        @click="invitationToFeatureChatAccepted(notification.feature, notification.featureId)"
        v-if="notification.read === 0">
        {{ $t("message.accept")}}
      </v-btn>
      <v-btn dark outline small color="grey"
        @click="invitationDeclined(notification.feature)"
        v-if="notification.read === 0">
        {{ $t("message.decline")}}
      </v-btn>
      <v-icon v-if="notification.read === 1"
        color="green darken-2"
      >done</v-icon>
    </v-list-tile-action>

  </v-list-tile>
  <v-divider md12></v-divider>
</v-container>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import ol from 'openlayers';
import config from '../config';
import olMap from '../js/map';
import styles from '../js/styles';

export default {
  props: ['notification'],
  data() {
    return {
    };
  },
  methods: {
    loadCollection(e) {
      const tl = {
        id: e._id, // eslint-disable-line no-underscore-dangle
        type: 'collection',
        title: e.title,
        visibility: e.visibility,
        userCreated: e.user,
      };
      console.log('load users tl::', e);
      // const goToPath = `/main/search/collection/${e}`;
      // console.log('going to path:: ', goToPath);
      // this.$router.push({ path: goToPath });
      this.$store.commit('setActiveTab', 'explore');
      this.$store.dispatch('setOpenedCustomTimeline', tl);
      // this.$eventHub.$emit('openCollection', e);
    },
    loadUsersTl(e) {
      const tl = {
        id: e,
        type: 'timeline',
      };
      console.log('load users tl::', e);
      // const goToPath = `/main/search/collection/${e}`;
      // console.log('going to path:: ', goToPath);
      // this.$router.push({ path: goToPath });
      this.$store.commit('setActiveTab', 'explore');
      this.$store.dispatch('setOpenedCustomTimeline', tl);
      // this.$eventHub.$emit('openTimeline', e);
    },
    loadFeatures(newFeature) {
      const geojsonFormat = new ol.format.GeoJSON();
      console.log('load features', newFeature);
      if (newFeature !== '{"type":"FeatureCollection","features":[]}' && newFeature !== null) {
        let allLayers = [];
        allLayers = olMap.getLayers().getArray();
        allLayers.forEach((layer) => {
          if (layer.getProperties().name === 'customLayer') {
            const AddedFeature = geojsonFormat.readFeatures(newFeature);
            let alreadyExists = false;
            layer.getSource().forEachFeature((feature) => {
              // console.log(AddedFeature);
              if (feature.get('mongoID') === AddedFeature[0].getProperties().mongoID) {
                alreadyExists = true;
              }
            });
            if (!AddedFeature[0].getProperties().mongoID) {
              alreadyExists = false;
            }
            const g = AddedFeature[0].getGeometry().getExtent();
            if (alreadyExists === false) {
              layer.getSource().addFeatures(AddedFeature);
            }
            if (g[0] - g[2] < 500) {
              g[0] -= 200;
              g[2] += 200;
            }
            if (g[1] - g[3] < 500) {
              g[1] -= 200;
              g[3] += 200;
            }
            olMap.getView().fit(g, olMap.getSize());
            const cs = AddedFeature[0].getStyle();

            AddedFeature[0].setStyle(styles.BoldLineString);

            setTimeout(() => {
              AddedFeature[0].setStyle(cs);
              olMap.updateSize();
            }, 500);
          }
        });
      }
    },
    markAsRead() {
      this.notification.read = 1;
      const url = `${config.url}/notifications/markAsRead`;
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
      const url = `${config.url}/notifications/markAsRead`;
      const data = {
        id: this.notification._id, // eslint-disable-line no-underscore-dangle
      };
      axios.post(url, { data },
        {
          headers: { 'x-access-token': this.$store.state.token },
        });
    },
    invitationAccepted(collectionId) {
      console.log(collectionId);
      const url = `${config.url}/collections/setMembership`;
      const data = {
        memberId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        collectionsToFollow: [collectionId],
        collectionsToUnfollow: [],
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
          this.$socket.emit('joinCollections', [collectionId]);
        });
    },
    invitationToFeatureChatAccepted(feature, id) {
      console.log('accepted invitation for :: ', feature, id);
      const geojsonFormat = new ol.format.GeoJSON();
      const chatFeature = geojsonFormat.readFeature(feature);
      chatFeature.mongoID = id;
      console.log('chatFeature:: ', chatFeature);
      this.loadFeatures(feature);
      const allLayers = olMap.getLayers().getArray();
      allLayers.forEach((layer) => {
        if (layer.get('name') && layer.get('name') === 'customLayer') {
          layer.getSource().forEachFeature((f) => {
            if (f.get('mongoID') === id) {
              olMap.getInteractions().forEach((interaction) => {
                if (interaction instanceof ol.interaction.Select) {
                  interaction.setActive(true);
                  interaction.getFeatures().clear();
                  interaction.getFeatures().push(f);
                  this.toolColors = ['white', 'white', 'white'];
                  this.selectedTool = 'selectFeatures';
                  this.$store.dispatch('setFeature', chatFeature);
                  console.log('chatFeature2:: ', chatFeature);
                  const joinFeatureChat = { fid: id, user: this.$store.state.user.name };
                  console.log('feature chat signal :: ', joinFeatureChat);
                  this.$socket.emit('joinFeatureChat', joinFeatureChat);
                }
              });
            }
          });
        }
      });

      // save notification to db if user is not logged in
      // save feature and dialogs to db in a new collection
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
