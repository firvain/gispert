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
          <v-btn color="primary" dark fab outline small @click="dialogCollections = true">
            <v-icon color="green lighten-1">list</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
    <v-dialog v-model="dialogCollections" scrollable max-width="300px">
      <!-- <v-tooltip bottom> -->
        <!-- <span>{{ $t("message.checkCollectionsOut")}}</span>
      </v-tooltip> -->
      <v-card>
        <v-card-title>{{ $t('message.chooseCollectionsToFollow') }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text style="height: 300px; color: black;">
          <!-- {{ $t('message.choose') }} -->
          {{ selectedCollections }}
          <!-- <v-tooltip bottom>
            <v-select
              slot="activator"
              :label="$t('message.choose')"
              :items="userCollections"
              item-text="title"
              item-value="_id"
              v-model="selectedCollections"
              multiple
              max-height="400"
              :hint="$t('message.chooseCollectionsToFollow')"
              persistent-hint
              v-on:change="listChanged = true"
              loading=true
            ></v-select>
            <span>{{ $t("message.checkCollectionsOut")}}</span>
          </v-tooltip> -->
            <v-checkbox
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
          <v-btn outline small @click="addMembershipToCollections()">
            {{ $t('message.save') }}
            <v-icon color="green lighten-1">save</v-icon>
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
    listChanged: false,
    dialogCollections: false,
  }),
  methods: {
    explore() {
      this.$emit('explore', this.user);
    },
    addMembershipToCollections() {
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections/addmember`;
      const data = {
        memberId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        collectionsId: this.selectedCollections,
        userCreated: this.user._id, // eslint-disable-line no-underscore-dangle
      };
      axios.post(url, { data }, {
        headers: { 'x-access-token': this.$store.state.token },
      })
      .then(() => {
        this.listChanged = false;
        this.$socket.emit('followedCollection', data);
        this.$eventHub.$emit('refreshprivatecollections');
        this.$eventHub.$emit('refreshpubliccollections');
        // console.log('mark as followed and notify user');
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
