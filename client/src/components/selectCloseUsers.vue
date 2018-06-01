<template>
  <v-card>
    <v-card-title>Select users</v-card-title>
    <v-divider></v-divider>
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
import config from '../config';

export default {
  name: 'userSelector',
  data: () => ({
    users: [],
    selectedUsers: [],
    loading: false,
    listChanged: true,
    searchUsers: [],
  }),
  mounted() {
    console.log('mounted');
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
  methods: {
    summonToChat() {
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

