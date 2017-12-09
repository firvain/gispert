<template>
  <v-layout column>
    <v-toolbar class="orange no-padding" dark>
      <i class="fa fa-map fa-4x"></i><v-toolbar-title><h3>Terra Cognita</h3></v-toolbar-title><h6>Collaborative Maps</h6>
      <v-spacer></v-spacer>
        <v-toolbar-items>
          <router-link to="../../register">
            <v-btn flat v-if="!$store.state.isUserLoggedIn">
              {{signup}}
            </v-btn>
          </router-link>
          <router-link to="../../login">
            <v-btn flat v-if="!$store.state.isUserLoggedIn">
              {{login}}
            </v-btn>
            </router-link>
          <router-link to="../../login">
            <v-btn flat v-if="$store.state.isUserLoggedIn" @click="logoutUser">
              {{logout}}
            </v-btn>
            </router-link>
        </v-toolbar-items>
    </v-toolbar>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      signup: 'Εγγραφή',
      login: 'Είσοδος',
      logout: 'Έξοδος',
    };
  },
  methods: {
    logoutUser() {
      this.$store.dispatch('setToken', null);
      this.$store.dispatch('setUser', null);
      this.$store.dispatch('setMapVisibility', false);
    },
  },
};
</script>
