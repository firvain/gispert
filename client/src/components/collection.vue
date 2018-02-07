<template>
    <v-flex xs12 sm12>
      <v-list-tile @click="exploreCollection(collection._id)">
        <v-list-tile-content>
          <v-list-tile-title>{{ collection.title }} του χρήστη {{collection.username}}</v-list-tile-title>
          <v-list-tile-sub-title>{{ collection.description }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn icon ripple @click="deleteCollection(collection._id)" v-if="this.$store.state.isUserLoggedIn && collection.user === this.$store.state.user._id">
            <v-icon color="grey lighten-1">delete</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action>
          <v-btn icon ripple v-if="this.$store.state.isUserLoggedIn && collection.user === this.$store.state.user._id">
            <v-icon color="grey lighten-1">edit</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action>
          <v-btn icon ripple>
            <v-icon color="grey lighten-1">share</v-icon>
          </v-btn>
        </v-list-tile-action>
        <p v-if="collection.members" >Αριθμός μελών: {{ collection.members.length }}</p>
      </v-list-tile>
      <!-- <v-layout row wrap v-if="details">
        <v-flex
          md12
          v-for="post in posts"
          :key="post._id"
        >
          <post :post='post'></post>
        </v-flex>
      </v-layout> -->
    </v-flex>
</template>
<script>
import axios from 'axios';
import config from '../config';
import post from './post';

export default {
  props: ['collection'],
  name: 'collection',
  data: () => ({
    details: false,
    posts: null,
    loading: false,
  }),
  components: {
    post,
  },
  methods: {
    exploreCollection(id) {
      // TODO make correct request
      const serverUrl = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections/collection`;
      axios.get(serverUrl, { params: {
        start: 0,
        end: 50,
        // eslint-disable-next-line
        userId: this.$store.state.user._id,
        collectionId: id,
      },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        this.posts = response.data;
      }).then(() => {
        this.loading = false;
        this.details = true;
      });

      const serverUrl1 = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/register/encrypt`;
      axios.post(serverUrl1, { params: {
        start: 0,
      },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        this.posts = response.data;
      }).then(() => {
        this.loading = false;
        this.details = true;
      });
    },
    deleteCollection(id) {
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections/delete`;
      // console.log('id to delete:: ', id);
      axios.post(url, { id }, {
        headers: { 'x-access-token': this.$store.state.token },
      }).then(() => {
        this.loading = false;
        if (this.collection.visibility === 'private') {
          this.$parent.$parent.$emit('refreshprivatecollections', 'refresh');
        }
        if (this.collection.visibility === 'public') {
          this.$store.dispatch('deletePrivateCollection', id);
          this.$store.dispatch('deletePublicCollection', id);
          this.$parent.$parent.$emit('refreshpubliccollections', 'refresh');
        }
      });
    },
  },
};
</script>
