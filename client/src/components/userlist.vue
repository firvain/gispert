<template>
  <div id='userList'>
    <v-container fluid v-bind="{ [`grid-list-${size}`]: true }" v-if="mode === 0">
      <v-layout row wrap v-if="$store.state.users.length > 0">
        <v-flex md8>
          <v-text-field
            name="search-input"
            label="Αναζήτηση"
            hint="Τουλάχιστον 4 χαρακτήρες"
            v-model="searchUsers"
            min="4"
            append-icon="search"
          ></v-text-field>
        </v-flex>
        <v-flex md4>
          <v-btn fab outline v-on:click='mode = 0'>
            <v-icon color="green lighten-1">search</v-icon>
          </v-btn>
          <v-btn fab outline v-on:click='mode = 0'>
            <v-icon color="green lighten-1">clear</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <!-- <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i> -->

        <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>

        <v-flex
          md12
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
        φορτωση περισσότερων
        <v-icon right dark>navigate_next</v-icon>
      </v-btn>
    </v-container>
  </div>
</template>
<script>
import axios from 'axios';
import config from '../config';
import user from './user';
import cardDetails from './card_in_details';

export default {
  name: 'userlist',
  data() {
    return {
      // users: [],
      size: 'xl',
      expand: 'md12',
      mode: 0,
      explore_estate: null,
      loading: false,
      searchUsers: '',
      page: 25,
    };
  },
  components: {
    user, cardDetails,
  },
  methods: {
    explore(estate) {
      this.mode = 1;
      this.explore_estate = estate;
      return estate;
    },
    loadUsers() {
      if (this.$store.state.isUserLoggedIn) {
        this.loading = true;
        const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/users/all`;
        axios.get(url, {
          params: {
            pageFrom: 0,
            pageTo: 25,
          },
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          if (response.data.success === false) {
            console.log(response.data);
            console.log('not logged in to see others');
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
          pageFrom: this.page,
          pageTo: this.page + 25,
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        if (response.data.success === false) {
          console.log(response.data);
          console.log('not logged in to see others');
        } else {
          this.$store.dispatch('setUsers', response.data);
          // this.users = response.data;
        }
      }).then(() => {
        this.page += 25;
        this.loading = false;
      });
    },
  },
  mounted() {
    this.$store.dispatch('setUsers', 'empty');
    this.loadUsers();
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
