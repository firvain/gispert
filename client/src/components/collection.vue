<template>
    <v-flex xs12 sm12>
      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>{{ collection.title }} του χρήστη {{collection.username}}</v-list-tile-title>
          <v-list-tile-sub-title>
            {{ collection.description }}
            <v-btn v-if="collection.members" flat disabled small color="primary">Αριθμός μελών: {{ collection.members.length }}</v-btn>
          </v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn fab small outline @click="exploreCollection(collection._id)">
            <v-icon color="blue lighten-1" v-if="details">folder_open</v-icon>
            <v-icon color="blue lighten-1" v-if="details === false">folder</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action>
          <v-btn fab small outline @click="unfollowCollectionDialog = true" v-if="this.$store.state.isUserLoggedIn && collection.user !== this.$store.state.user._id">
            <v-icon color="red lighten-1">visibility_off</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action>
          <v-btn fab small outline @click="deleteCollectionDialog = true" v-if="this.$store.state.isUserLoggedIn && collection.user === this.$store.state.user._id">
            <v-icon color="red lighten-1">delete</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action>
          <v-btn fab small outline v-if="this.$store.state.isUserLoggedIn && collection.user === this.$store.state.user._id">
            <v-icon color="orange lighten-1">edit</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action>
          <v-btn fab small outline @click="shareDialog = true" v-if="this.$store.state.isUserLoggedIn && collection.user === this.$store.state.user._id">
            <v-icon color="green lighten-1">share</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
      <v-dialog v-model="shareDialog" persistent max-width="350">
        <v-card>
          <v-card-title class="headline">Διάλεξε με ποιους θα μοιράζεσαι αυτή τη συλλογή</v-card-title>
          <v-card-text>
            <v-flex xs12 sm12>
              <!-- TODO: must exclude this user from this list v-bind:items="this.$store.state.users  -->
            <v-select v-if="this.$store.state.users"
              label="Επιλογή"
              v-bind:items="this.$store.state.users"
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
      <v-dialog v-model="deleteCollectionDialog" persistent max-width="290">
        <v-card>
          <v-card-title class="headline">Διαγραφή Συλλογής;</v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat @click.native="deleteCollection(collection._id)">NAI</v-btn>
            <v-btn color="green darken-1" flat @click.native="deleteCollectionDialog = false">OXI</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="unfollowCollectionDialog" persistent max-width="290">
        <v-card>
          <v-card-title class="headline">Παρακολούθηση συλλογής</v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat @click.native="unfollowCollection(collection._id)">Μη Παρακολούθηση</v-btn>
            <v-btn color="green darken-1" flat @click.native="unfollowCollectionDialog = false">Ακυρο</v-btn>
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
      <!-- <collectionView v-if="details" :id="collection._id"></collectionView> -->
    </v-flex>
</template>
<script>
import axios from 'axios';
import config from '../config';
import post from './post';
// import collectionView from './collectionView';

export default {
  props: ['collection'],
  name: 'collection',
  data: () => ({
    details: false,
    posts: null,
    loading: false,
    shareDialog: false,
    deleteCollectionDialog: false,
    unfollowCollectionDialog: false,
    members: [],
  }),
  components: {
    post,
  },
  mounted() {
    this.members = this.collection.members;
  },
  computed: {
    collectionMembers(members) {
      const thisCollectionUsers = this.$store.state.users;
      console.log(members);
      // members.forEach((c) => {
      //   thisCollectionUsers.remove(c);
      // });
      return thisCollectionUsers;
    },
  },
  methods: {
    exploreCollection(id) {
      // TODO make correct request
      if (this.details) {
        this.$parent.$parent.$emit('openedcollection', null);
        // console.log('collection is open');
      } else {
        this.$parent.$parent.$emit('openedcollection', id);
        // console.log('collection closed');
      }
      this.details = !this.details;
    },
    deleteCollection(id) {
      this.deleteCollectionDialog = false;
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
    unfollowCollection(id) {
      this.unfollowCollectionDialog = false;
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections/unfollow`;
      // console.log('id to delete:: ', id);
      const data = {
        memberId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        collectionId: id,
      };
      axios.post(url, { data }, {
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
