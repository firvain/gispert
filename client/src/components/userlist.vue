<template>
  <div id='userList'>
    <v-container>
      <v-layout row wrap v-if="$store.state.users.length > 0">
        <v-flex md8>
          <v-text-field
            name="search-input"
            :label="$t('message.search')"
            :hint="$t('message.searchHint')"
            v-model="searchUsers"
            min="4"
            append-icon="search"
          ></v-text-field>
        </v-flex>
        <v-flex md4>
          <v-btn fab outline v-on:click='searchInUsers'>
            <v-icon color="green lighten-1">search</v-icon>
          </v-btn>
          <v-btn fab outline v-on:click="mode = 'normal'">
            <v-icon color="green lighten-1">clear</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container fluid v-bind="{ [`grid-list-${size}`]: true }" v-if="mode === 'normal'">
      <v-layout row wrap>
        <!-- <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i> -->

        <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>

        <v-flex
          md12
          v-if="mode = 'normal'"
          v-for="user in this.$store.state.users"
          :key="user._id"
        >
          <user :user='user' @explore="explore">
          </user>
        </v-flex>
      </v-layout>
      <v-btn
        v-if="$store.state.isUserLoggedIn"
        v-on:click='nextPageLoadUsers'
        class="blue-grey white--text"
        block
      >
        {{ $t("message.loadMore")}}
        <v-icon right dark>navigate_next</v-icon>
      </v-btn>
    </v-container>
    <userTimeline :id="exploreCollection._id" v-if="mode === 'explore'"></userTimeline>
    <v-btn block dark outline small color="green" @click="exploreCollection = null; mode = 'normal';" v-if="exploreCollection !== null && mode==='explore'">
      <v-icon dark>undo</v-icon>
      {{ $t("message.back")}}
    </v-btn>
    <v-container v-if="mode === 'search'">
      <v-flex
        md12
        v-if="mode = 'search'"
        v-for="user in searchResultUsers"
        :key="user._id"
      >
        <user :user='user' @explore="explore">
        </user>
      </v-flex>
    </v-container>
  </div>
</template>
<script>
import axios from 'axios';
import config from '../config';
import user from './user';
import userTimeline from './userTimeline';

export default {
  name: 'userlist',
  data() {
    return {
      // users: [],
      size: 'xl',
      expand: 'md12',
      mode: 'normal',
      exploreCollection: null,
      loading: false,
      searchUsers: '',
      searchResultUsers: [],
      page: 25,
    };
  },
  components: {
    user, userTimeline,
  },
  methods: {
    explore(collectionId) {
      this.mode = 'explore';
      this.exploreCollection = collectionId;
      this.loading = false;
      return collectionId;
    },
    loadUsers() {
      if (this.$store.state.isUserLoggedIn) {
        this.loading = true;
        const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/users/all`;
        axios.get(url, {
          params: {
            userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
            pageFrom: 0,
            pageTo: 25,
          },
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          if (response.data.success === false) {
            // console.log(response.data);
            // console.log('not logged in to see others');
          } else {
            this.$store.dispatch('setUsers', response.data);
            // this.users = response.data;
          }
        }).then(() => {
          this.loading = false;
        });
      }
    },
    nextPageLoadUsers() {
      this.loading = true;
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/users/all`;
      axios.get(url, {
        params: {
          userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
          pageFrom: this.page,
          pageTo: this.page + 25,
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        if (response.data.success === false) {
          // console.log(response.data);
          // console.log('not logged in to see others');
        } else {
          this.$store.dispatch('setUsers', response.data);
          // this.users = response.data;
        }
      }).then(() => {
        this.page += 25;
        this.loading = false;
      });
    },
    searchInUsers() {
      this.mode = 'search';
      if (this.$store.state.isUserLoggedIn) {
        this.loading = true;
        const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/users/search`;
        axios.get(url, {
          params: {
            keyword: this.searchUsers,
          },
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          if (response.data) {
            this.searchResultUsers = response.data;
            // this.users = response.data;
          }
        }).then(() => {
          this.loading = false;
        });
      }
    },
  },
  mounted() {
    if (this.$store.state.users.length === 0) {
      this.loadUsers();
    }

    this.$eventHub.$on('logged-in', () => {
      this.loadUsers();
    });
  },
};
</script>
<style>
#userList {
  color: black;
  max-height: 82vh;
  overflow-y: scroll;
}
</style>
