<template>
  <div>
    <v-toolbar color="orange" dark>
      <v-toolbar-side-icon></v-toolbar-side-icon>
      <v-toolbar-title>Συλλογές</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>search</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>view_module</v-icon>
      </v-btn>
    </v-toolbar>
    <div v-if="postOpen">
      <v-btn flat icon color="pink" @click="postOpen = false">
        <v-icon>close</v-icon>
      </v-btn>
      <post :post='postContent' v-if="postContent !== null"></post>
    </div>
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
      postContent: null,
      postOpen: false,
    };
  },
  components: {
    collectionsList, post,
  },
  watch: {
    '$route.params.id': function handle() {
      this.loadPostFromPermalink();
    },
  },
  methods: {
    getPublicCollections() {
      const serverUrl = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections`;
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
      const serverUrl = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections`;
      axios.get(serverUrl, { params: {
        type: 'private',
      },
      }).then((response) => {
        this.privateCollections = response.data;
      }).then(() => {
        this.loading = false;
      });
    },
    loadPostFromPermalink() {
      this.postContent = null;
      const id = this.$route.params.id;
      let pUrl;
      let userIdCurrent;
      let token;
      console.log(id);
      if (this.$store.state.isUserLoggedIn) {
        pUrl = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts/id`;
        userIdCurrent = this.$store.state.user.id;
        token = this.$store.state.token;
      } else {
        pUrl = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/public/postid`;
        userIdCurrent = null;
        token = null;
      }
      if (id) {
        axios.get(pUrl, {
          params: {
            pId: id,
            userId: userIdCurrent,
          },
          headers: { 'x-access-token': token },
        }).then((resp) => {
          if (resp.data.success === false) {
            console.log('not logged in to see post');
          } else {
            console.log(resp.data);
            this.postContent = resp.data[0];
            console.log('postContent:: ', this.postContent);
            this.postOpen = true;
          }
        }).then(() => {
          this.loading = false;
        });
      }
    },
  },
};
</script>
