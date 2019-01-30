<template>
  <v-container fluid class="pa-0">
  <Pageheader></Pageheader>
      <v-layout row wrap>
        <v-flex xs4 md4>
          <tabs></tabs>
        </v-flex>
        <v-flex xs8 md8>
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
// import axios from 'axios';
// import timeline from './timeline';
import tabs from './tabs';
import mapDiv from './map';
// import post from './post';
// import config from '../config';

export default {
  name: 'mainpage',
  components: {
    tabs, mapDiv, Pageheader,
  },
  data() {
    return {
      postContent: null,
      postOpen: false,
      drawer: null,
      items: [
        { title: 'Home', icon: 'dashboard' },
        { title: 'About', icon: 'question_answer' },
      ],
      right: null,
      olMap: false,
      language: 'el_GR',
    };
  },
  mounted() {
    this.olMap = true;
    this.$socket.emit('refreshPosts', 'refreshPosts');
    if (this.$route.name === 'post') {
      // console.log('loading post from permalink');
      this.loadPostFromPermalink(this.$route.params.id);
    }
    if (this.$route.name === 'collection') {
      console.log('loading collection from permalink');
      this.loadCollectionFromPermalink(this.$route.params.id);
    }
  },
  watch: {
    '$route.params': function handle() {
      // console.log('main router changed and emitting!!!!!!', this.$route.params.id);
      if (this.$route.name === 'post') {
        // console.log('loading post from permalink');
        this.loadPostFromPermalink(this.$route.params.id);
      }
      if (this.$route.name === 'collection') {
        console.log('loading collection from permalink');
        this.loadCollectionFromPermalink(this.$route.params.id);
      }
      // this.$eventHub.$emit('routerChanged', 'routerChanged');
    },
  },
  methods: {
    loadPostFromPermalink(id) {
      this.$store.commit('setActiveTab', 'explore');
      this.$eventHub.$emit('openPost', id);
    },
    loadCollectionFromPermalink(id) {
      console.log('loading collection from permalink::', id);
      this.$store.commit('setActiveTab', 'explore');
      const tl = {
        id,
        type: 'collection',
        isEditor: false,
        visibility: 'public',
      };
      this.$store.dispatch('setOpenedCustomTimeline', tl);
      this.$eventHub.$emit('openCollection', id);
    },
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
