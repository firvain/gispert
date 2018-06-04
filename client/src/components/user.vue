<template>
  <v-layout>
    <v-flex xs12 sm12>
      <v-card>
        <v-card-title primary-title height="100px">
          <a md12 v-if="user.name" @click="explore">@{{user.name}}</a>
        </v-card-title>
        <v-card-text v-if="user.description">
          {{user.description}}
        </v-card-text>
        <v-card-actions class="grey lighten-3">
          <v-switch
            slot="activator"
            :label="$t('message.liveMapUpdate')"
            v-model="showLive"
            color="success"
          ></v-switch>
          <v-btn color="primary" dark fab outline small @click="dialogCollections = true; getCollections(user._id);">
            <v-icon color="green lighten-1">list</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
    <v-dialog v-model="dialogCollections" scrollable max-width="300px">
      <v-card>
        <v-card-title>{{ $t('message.chooseCollectionsToFollow') }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text style="height: 300px; color: black;">
            <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
            <v-checkbox @click.native="listChanged = true; updateArrays(collection._id);"
              v-for='collection in userCollections'
              :key='collection._id'
              :label="collection.title"
              v-model="selectedCollections"
              :value="collection._id"
            >
            </v-checkbox>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn outline small @click="setMembershipToCollections(); dialogCollections = false;" v-if="listChanged">
            {{ $t('message.save') }}
            <v-icon color="green lighten-1">save</v-icon>
          </v-btn>
          <v-btn outline small @click="dialogCollections = false; selectedCollections = [];">
            {{ $t('message.close') }}
            <v-icon color="green lighten-1">close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import axios from 'axios';
import config from '../config';

export default {
  props: ['user'],
  name: 'user',
  data: () => ({
    showLive: true,
    userCollections: [],
    selectedCollections: [],
    unfollowThese: [],
    followThese: [],
    listChanged: false,
    dialogCollections: false,
    loading: false,
    initialCollections: [],
  }),
  methods: {
    explore() {
      this.$emit('explore', this.user);
    },
    updateArrays() {
      this.unfollowThese = [];
      this.followThese = [];
      this.initialCollections.forEach((c) => {
        if (!this.selectedCollections.includes(c)) {
          this.unfollowThese.push(c);
        }
      });
      this.selectedCollections.forEach((c) => {
        if (!this.initialCollections.includes(c)) {
          this.followThese.push(c);
        }
      });
    },
    setMembershipToCollections() {
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections/setMembership`;
      const data = {
        memberId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        collectionsToFollow: this.followThese,
        collectionsToUnfollow: this.unfollowThese,
        userCreated: this.user._id, // eslint-disable-line no-underscore-dangle
      };
      axios.post(url, { data }, {
        headers: { 'x-access-token': this.$store.state.token },
      })
      .then(() => {
        this.listChanged = false;
        data.collectionsToFollow.forEach((cId) => {
          const signal = { collectionId: cId };
          this.$socket.emit('followedCollection', signal);
        });
        data.collectionsToUnfollow.forEach((cId) => {
          const signal = { collectionId: cId };
          this.$socket.emit('unfollowedCollection', signal);
        });
        this.$eventHub.$emit('refreshprivatecollections');
        this.$eventHub.$emit('refreshpubliccollections');
        // console.log('mark as followed and notify user');
      });
    },
    getCollections(id) {
      this.loading = true;
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/users/collectionsOfUser`;
      axios.get(url, {
        params: {
          userId: id,
          memberId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        this.userCollections = response.data;
      }).then(() => {
        const idsOfCollections = [];
        this.$store.state.publicCollections.forEach((c) => {
          idsOfCollections.push(c._id); // eslint-disable-line no-underscore-dangle
        });
        this.$store.state.privateCollections.forEach((c) => {
          idsOfCollections.push(c._id); // eslint-disable-line no-underscore-dangle
        });
        return idsOfCollections;
      }).then((idsOfCollections) => {
        this.userCollections.forEach((collection) => {
          const checkId = collection._id; // eslint-disable-line no-underscore-dangle
          if (idsOfCollections.includes(checkId)) {
            this.selectedCollections.push(checkId);
            this.initialCollections.push(checkId);
          }
        });
        this.loading = false;
      });
    },
  },
  mounted() {
    this.userCollections = this.user.collectionData;
  },
};
</script>
<style>
  a:hover {
    cursor: pointer;
  }
</style>
