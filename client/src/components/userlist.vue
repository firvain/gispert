<template>
  <div id="userList">
    <v-container>
      <v-layout v-if="$store.state.users.length > 0" row wrap>
        <v-flex>
          <v-text-field
            v-model="searchUsers"
            name="search-input"
            :label="$t('message.search')"
            :hint="$t('message.searchHint')"
            min="4"
            append-icon="search"
            @keyup.enter="searchInUsers"
          ></v-text-field>
          <!-- <v-btn fab small outline v-on:click='searchInUsers'>
            <v-icon color="green lighten-1">search</v-icon>
          </v-btn> -->
        </v-flex>
        <v-flex>
          <v-btn fab small outline @click="mode = 'normal'">
            <v-icon color="green lighten-1">clear</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container
      v-if="mode === 'normal'"
      fluid
      v-bind="{ [`grid-list-${size}`]: true }"
      pa-1
    >
      <v-container v-if="(mode = 'normal')" row wrap>
        <!-- <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i> -->

        <v-progress-linear
          v-show="loading"
          :indeterminate="true"
        ></v-progress-linear>

        <v-flex v-for="user in this.$store.state.users" :key="user._id" md12>
          <user :user="user" @explore="explore"> </user>
        </v-flex>
      </v-container>
      <v-btn
        v-if="$store.state.isUserLoggedIn && endOfUsers === false"
        block
        @click="nextPageLoadUsers"
      >
        {{ $t("message.loadMore") }}
        <v-icon right dark>navigate_next</v-icon>
      </v-btn>
    </v-container>
    <userTimeline
      v-if="mode === 'explore'"
      :id="exploreCollection._id"
    ></userTimeline>
    <v-btn
      v-if="exploreCollection !== null && mode === 'explore'"
      block
      dark
      outline
      small
      color="green"
      @click="
        exploreCollection = null;
        mode = 'normal';
      "
    >
      <v-icon dark>undo</v-icon>
      {{ $t("message.back") }}
    </v-btn>
    <v-container v-if="mode === 'search'">
      <v-flex v-for="user in searchResultUsers" :key="user._id" md12>
        <user :user="user" @explore="explore"> </user>
      </v-flex>
    </v-container>
  </div>
</template>
<script>
import axios from "axios";
import config from "../config";
import user from "./user";
import userTimeline from "./userTimeline";

export default {
  name: "Userlist",
  components: {
    user,
    userTimeline
  },
  data() {
    return {
      // users: [],
      size: "xl",
      expand: "md12",
      mode: "normal",
      exploreCollection: null,
      loading: false,
      searchUsers: "",
      searchResultUsers: [],
      page: 25,
      endOfUsers: false
    };
  },
  mounted() {
    // if (this.$store.state.users.length === 0) {
    //   console.log('loading users in userlist!');
    //   this.loadUsers();
    // }
    // this.$eventHub.$on('logged-in', () => {
    //   if (this.$store.state.users.length === 0) {
    //     this.loadUsers();
    //   }
    // });
  },
  methods: {
    explore(collectionId) {
      this.mode = "explore";
      this.exploreCollection = collectionId;
      this.loading = false;
      return collectionId;
    },
    loadUsers() {
      console.log("loading users in userlist load users!");
      if (this.$store.state.isUserLoggedIn) {
        this.loading = true;
        const url = `${config.url}/users/all`;
        axios
          .get(url, {
            params: {
              userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
              pageFrom: 0,
              pageTo: 25
            },
            headers: { "x-access-token": this.$store.state.token }
          })
          .then(response => {
            if (response.data.success === false) {
              if (response.data.length < 25) {
                this.endOfUsers = true;
              }
              // console.log(response.data);
              // console.log('not logged in to see others');
            } else {
              console.log("dispatching users to vuex:: ", response.data);
              this.$store.dispatch("setUsers", response.data);
              // this.users = response.data;
            }
          })
          .then(() => {
            this.loading = false;
          });
      }
    },
    nextPageLoadUsers() {
      console.log("loading next user page");
      this.loading = true;
      const url = `${config.url}/users/all`;
      axios
        .get(url, {
          params: {
            userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
            pageFrom: this.page,
            pageTo: this.page + 25
          },
          headers: { "x-access-token": this.$store.state.token }
        })
        .then(response => {
          if (response.data.length === 0) {
            console.log("success::", response.data.success);
            if (response.data.length < 25) {
              this.endOfUsers = true;
            }
            // console.log(response.data);
            // console.log('not logged in to see others');
          } else {
            this.$store.dispatch("setUsers", response.data);
            // this.users = response.data;
          }
        })
        .then(() => {
          this.page += 25;
          this.loading = false;
        });
    },
    searchInUsers() {
      this.mode = "search";
      if (this.$store.state.isUserLoggedIn) {
        this.loading = true;
        const url = `${config.url}/users/search`;
        axios
          .get(url, {
            params: {
              userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
              keyword: this.searchUsers
            },
            headers: { "x-access-token": this.$store.state.token }
          })
          .then(response => {
            if (response.data) {
              this.searchResultUsers = response.data;
              // this.users = response.data;
            }
          })
          .then(() => {
            this.loading = false;
          });
      }
    }
  }
};
</script>
<style>
#userList {
  color: black;
  max-height: 82vh;
  overflow-y: scroll;
}
</style>
