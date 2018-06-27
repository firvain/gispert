<template>
    <v-layout row>
      <collectionsList></collectionsList>
    </v-layout>
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
