<template>
    <v-flex xs12 sm12>
      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>{{ collection.title }} του χρήστη {{collection.username}}</v-list-tile-title>
          <v-list-tile-sub-title>{{ collection.description }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn icon ripple @click="exploreCollection(collection._id)">
            <v-icon color="grey lighten-1">folder_open</v-icon>
          </v-btn>
        </v-list-tile-action>
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
          <v-btn icon ripple @click="shareDialog = true">
            <v-icon color="grey lighten-1">share</v-icon>
          </v-btn>
        </v-list-tile-action>
        <p v-if="collection.members" >Αριθμός μελών: {{ collection.members.length }}</p>
      </v-list-tile>
      <v-dialog v-model="shareDialog" persistent max-width="350">
        <v-card>
          <v-card-title class="headline">Διάλεξε με ποιους θα μοιράζεσαι αυτή τη συλλογή</v-card-title>
          <v-card-text>
            <v-flex xs12 sm12>
            <v-select v-if="this.$store.state.users"
              label="Επιλογή"
              v-bind:items="collectionMembers(collection.members)"
              v-model="members"
              item-text="name"
              item-value="_id"
              multiple
              chips
              max-height="300px"
              autocomplete
            >
            </v-select>
            </v-flex>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat @click.native="shareDialog = false">Κλείσιμο</v-btn>
            <v-btn color="green darken-1" flat @click.native="saveCollectionMembers(collection._id)">Αποθήκευση</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
    shareDialog: false,
    members: [],
  }),
  components: {
    post,
  },
  mounted() {
  },
  computed: {
    collectionMembers(members) {
      const thisCollectionUsers = this.$store.state.users;
      members.forEach((c) => {
        thisCollectionUsers.remove(c);
      });
      return thisCollectionUsers;
    },
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
    saveCollectionMembers(id) {
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections/savemembers`;
      const ids = this.members;
      const data = { members: ids, collectionId: id };
      axios.post(url, { data }, {
        headers: { 'x-access-token': this.$store.state.token },
      }).then(() => {
        if (this.collection.visibility === 'private') {
          this.$parent.$parent.$emit('refreshprivatecollections', 'refresh');
        }
        if (this.collection.visibility === 'public') {
          this.$parent.$parent.$emit('refreshpubliccollections', 'refresh');
        }
        this.shareDialog = false;
      });
    },
  },
};
</script>
