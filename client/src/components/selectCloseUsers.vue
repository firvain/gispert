<template>
  <v-card>
    <v-card-title>Select users</v-card-title>
    <v-divider></v-divider>
    <v-card-text style="height: 300px; color: black;">
      <!-- <v-container> -->
      <v-text-field
        v-model="searchUsers"
        md8
        name="search-input"
        :label="$t('message.search')"
        :hint="$t('message.searchHint')"
        min="4"
        append-icon="search"
      ></v-text-field>
      <!-- </v-container> -->
      <v-progress-linear
        v-show="loading"
        :indeterminate="true"
      ></v-progress-linear>
      <v-checkbox
        v-for="user in users"
        :key="user._id.user"
        v-model="selectedUsers"
        :label="user._id.username"
        :value="user._id"
      >
      </v-checkbox>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn v-if="listChanged" outline small @click="summonToChat()">
        <!-- {{ $t('message.save') }} -->
        Summon!
        <v-icon color="green lighten-1">send</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import axios from "axios";
import ol from "openlayers";
import config from "../config";

export default {
  name: "UserSelector",
  props: ["active"],
  data: () => ({
    users: [],
    selectedUsers: [],
    loading: false,
    listChanged: true,
    searchUsers: []
  }),
  watch: {
    active: function loadusers() {
      if (this.active === true) {
        this.loadUsers();
      }
    }
  },
  mounted() {
    console.log("mounted");
  },
  methods: {
    loadUsers() {
      if (this.$store.state.isUserLoggedIn) {
        this.loading = true;
        const url = `${config.url}/users/usersToChatWith`;
        axios
          .get(url, {
            // eslint-disable-next-line
          params: { userId: this.$store.state.user._id },
            headers: { "x-access-token": this.$store.state.token }
          })
          .then(response => {
            this.users = response.data;
          })
          .then(() => {
            this.loading = false;
          });
      }
    },
    summonToChat() {
      console.log(this.$store.state.feature.mongoID);
      const geojson = new ol.format.GeoJSON();
      const signal = {
        id: this.$store.state.feature.get("mongoID"),
        sender: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        senderName: this.$store.state.user.name,
        receivers: this.selectedUsers,
        feature: geojson.writeFeature(this.$store.state.feature),
        timestamp: Date.now()
      };
      this.$socket.emit("invitationForFeatureChat", signal);
      console.log("sending feature::", signal);
      const joinFeatureChat = {
        fid: signal.id,
        user: this.$store.state.user.name
      };
      console.log("join feature chat signal :: ", joinFeatureChat);
      this.$socket.emit("joinFeatureChat", joinFeatureChat);
      // join a room with this geodata id
      // socket emit notification
      // notification accept and join room
    },
    searchMoreUsers() {
      // axios call for search users
    }
  }
};
</script>
