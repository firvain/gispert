<template>
  <v-card>
    <v-card-title>Select users</v-card-title>
    <v-divider></v-divider>
    <v-card-text style="height: 300px; color: black;">
      <!-- <v-container> -->
        <v-text-field md8
          name="search-input"
          :label="$t('message.search')"
          :hint="$t('message.searchHint')"
          v-model="searchUsers"
          min="4"
          append-icon="search"
        ></v-text-field>
      <!-- </v-container> -->
      <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
      <v-checkbox
        v-for='user in users'
        :key='user._id.user'
        :label="user._id.username"
        v-model="selectedUsers"
        :value="user._id"
      >
      </v-checkbox>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn outline small @click="summonToChat()" v-if="listChanged">
        <!-- {{ $t('message.save') }} -->
        Summon!
        <v-icon color="green lighten-1">send</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import axios from 'axios';
import ol from 'openlayers';
import config from '../config';

export default {
  name: 'userSelector',
  props: ['active'],
  data: () => ({
    users: [],
    selectedUsers: [],
    loading: false,
    listChanged: true,
    searchUsers: [],
  }),
  mounted() {
    console.log('mounted');
  },
  watch: {
    active: function loadusers() {
      if (this.active === true) {
        this.loadUsers();
      }
    },
  },
  methods: {
    loadUsers() {
      if (this.$store.state.isUserLoggedIn) {
        this.loading = true;
        const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/users/usersToChatWith`;
        axios.get(url, {
          // eslint-disable-next-line
          params: { userId: this.$store.state.user._id },
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          this.users = response.data;
        }).then(() => {
          this.loading = false;
        });
      }
    },
    summonToChat() {
      console.log(this.$store.state.feature.mongoID);
      const geojson = new ol.format.GeoJSON();
      const signal = {
        id: this.$store.state.feature.get('mongoID'),
        sender: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        senderName: this.$store.state.user.name,
        receivers: this.selectedUsers,
        feature: geojson.writeFeature(this.$store.state.feature),
        timestamp: Date.now(),
      };
      this.$socket.emit('invitationForFeatureChat', signal);
      console.log('sending feature::', signal);
      const joinFeatureChat = { fid: signal.id, user: this.$store.state.user.name };
      console.log('join feature chat signal :: ', joinFeatureChat);
      this.$socket.emit('joinFeatureChat', joinFeatureChat);
      // join a room with this geodata id
      // socket emit notification
      // notification accept and join room
    },
    searchMoreUsers() {
      // axios call for search users
    },
  },
};
</script>

