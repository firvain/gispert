<template>
  <div>
    <!-- <v-toolbar color="orange" dark>
      <v-toolbar-side-icon></v-toolbar-side-icon>
      <v-toolbar-title>Συλλογές</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>search</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>view_module</v-icon>
      </v-btn>
    </v-toolbar> -->
    <v-layout row>
      <collectionsList></collectionsList>
    </v-layout>
  </div>
</template>
<script>
import axios from 'axios';
import post from './post';
import config from '../config';
import collectionsList from './collectionsList';

export default {
  name: 'search',
  data() {
    return {
    };
  },
  components: {
    collectionsList, post,
  },
  // watch: {
  //   '$route.params.id': function handle() {
  //     console.log('router changed in search!!!!!!');
  //     this.loadPostFromPermalink();
  //   },
  // },
  // mounted() {
  //   this.$eventHub.$on('routerChanged', () => {
  //     console.log('router changed through main!!!!!!');
  //     this.loadPostFromPermalink();
  //   });
  // },
  methods: {
    getPublicCollections() {
      const serverUrl = `${config.url}/collections`;
      axios.get(serverUrl, { params: {
        type: 'public',
      },
      }).then((response) => {
        this.publicCollections = response.data;
      }).then(() => {
        this.loading = false;
      });
    },
    getPrivateCollections() {
      const serverUrl = `${config.url}/collections`;
      axios.get(serverUrl, { params: {
        type: 'private',
      },
      }).then((response) => {
        this.privateCollections = response.data;
      }).then(() => {
        this.loading = false;
      });
    },
  },
};
</script>
