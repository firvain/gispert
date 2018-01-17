<template>
  <div id='userList'>
    <v-container fluid v-bind="{ [`grid-list-${size}`]: true }" v-if="mode === 0">
      <v-layout row wrap>
        <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i>
        <v-flex
          md12
          v-for="user in users"
          :key="user._id"
        >
          <user :user='user' @explore="explore">
          </user>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container fluid v-else-if='mode === 1'>
      <v-btn round warning dark ripple raised large v-on:click='mode = 0'>
        <i class="fa fa-close fa-lg"> Close</i>
      </v-btn>
      <cardDetails v-bind:user="explore_estate"></cardDetails>
      <v-btn round warning dark ripple raised large v-on:click='mode = 0'>
        <i class="fa fa-close fa-lg"> Close</i>
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
      users: [],
      size: 'xl',
      expand: 'md12',
      mode: 0,
      explore_estate: null,
      loading: false,
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
  },
  mounted() {
    this.loading = true;
    const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/users/all`;
    axios.get(url).then((response) => {
      this.users = response.data;
    }).then(() => {
      this.loading = false;
    });
  },
};
</script>
<style>
#timeline {
  color: black;
}
</style>
