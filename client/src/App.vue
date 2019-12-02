<template>
  <div id="app">
    <v-app>
      <!-- <v-navigation-drawer v-model="drawer" right clipped :width='this.$vuetify.breakpoint.width/2' app>
        <div id='map'>here is the map</div>
      </v-navigation-drawer> -->
      <Pageheader></Pageheader>
      <router-view></router-view>
      <!-- <v-footer class="pa-0">
        <a flat @click='termsOfUseDialog = true'>Όροι χρήσης</a>
        <v-spacer></v-spacer>
        <div><a href='https://www.terracognita.eu' target='_blank'>Terra Cognita</a>, All rights reserved. © {{ new Date().getFullYear() }}</div>
      </v-footer> -->
    </v-app>
  </div>
</template>

<script>
import Pageheader from '@/components/pageheader';

export default {
  name: 'app',
  components: {
    Pageheader,
  },
  data() {
    return { };
  },
};
</script>
<style>
body {
  margin-bottom: 0px !important;
}

</style>

