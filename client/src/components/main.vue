<template>
  <v-container fluid class="pa-0">
  <Pageheader></Pageheader>
      <v-layout row wrap>
        <v-flex xs5 md5>
          <tabs></tabs>
        </v-flex>
        <v-flex xs7 md7>
          <mapDiv></mapDiv>
        </v-flex>
      </v-layout>
      <v-footer class="pa-3">
        <v-spacer></v-spacer>
        <div>Terra Cognita Ltd, All rights reserved. © {{ new Date().getFullYear() }}</div>
      </v-footer>
  </v-container>
</template>

<script>
import Pageheader from '@/components/pageheader';
import timeline from './timeline';
import tabs from './tabs';
import mapDiv from './map';

export default {
  name: 'main',
  components: {
    timeline, tabs, mapDiv, Pageheader,
  },
  data() {
    return {
      drawer: null,
      items: [
        { title: 'Home', icon: 'dashboard' },
        { title: 'About', icon: 'question_answer' },
      ],
      right: null,
      currentLanguage: 'en',
      olMap: false,
      logout: 'Αποσύνδεση',
    };
  },
  mounted() {
    this.olMap = true;
  },
};
</script>

<style>
#main {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 0px;
  margin: 0px;
}
html {   overflow-y: hidden; }
.nopadding {
  padding: 0px !important;
}
</style>
