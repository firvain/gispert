<template>
  <v-container id='collectionList'>
    <v-subheader inset v-if="this.$store.state.isUserLoggedIn">
      <v-btn fab dark outline small color="green" @click="addPrivateCollectionCard">
        <v-icon dark>add</v-icon>
      </v-btn>
      Προσωπικές Συλλογές
    </v-subheader>
    <v-container fluid v-if="this.$store.state.isUserLoggedIn">
      <v-list
        v-for="collection in privateCollections"
        :key="collection._id"
      >
        <collection :collection='collection'></collection>
      </v-list>
      <p v-if="privateCollections.length == 0">Δεν υπάρχουν προσωπικές συλλογές. Πρόσθεσε μία πατώντας
        <v-btn fab dark outline small color="green" @click="addPrivateCollectionCard">
          <v-icon dark>add</v-icon>
        </v-btn>
      </p>
      <form v-if="newPrivateCollectionCard">
        <v-text-field
          v-model="newCollection.title"
          label="Τίτλος"
          :counter="10"
          data-vv-name="name"
          required
        ></v-text-field>
        <v-text-field
          v-model="newCollection.description"
          label="Περιγραφή"
          :counter="10"
          data-vv-name="name"
          required
        ></v-text-field>
        <v-btn @click="createCollection">Αποθηκευση</v-btn>
        <v-btn @click="newPrivateCollectionCard = false">Ακυρο</v-btn>
      </form>
    </v-container>

    <v-subheader inset>
      <v-btn fab dark outline small color="green" @click="addPublicCollectionCard">
        <v-icon dark>add</v-icon>
      </v-btn>
      Δημόσιες Συλλογές
    </v-subheader>
    <v-container fluid>
      <v-list
        v-for="collection in publicCollections"
        :key="collection._id"
      >
        <collection :collection='collection'></collection>
      </v-list>
      <p v-if="publicCollections.length == 0">Δεν υπάρχουν δημόσιες συλλογές. Πρόσθεσε μία πατώντας
        <v-btn fab dark outline small color="green" @click="addPublicCollectionCard">
          <v-icon dark>add</v-icon>
        </v-btn>
      </p>
      <form v-if="newPublicCollectionCard">
        <v-text-field
          v-model="newCollection.title"
          label="Τίτλος"
          :counter="10"
          data-vv-name="name"
          required
        ></v-text-field>
        <v-text-field
          v-model="newCollection.description"
          label="Περιγραφή"
          :counter="10"
          data-vv-name="name"
          required
        ></v-text-field>
        <v-btn @click="createCollection">Αποθηκευση</v-btn>
        <v-btn @click="newPublicCollectionCard = false">Ακυρο</v-btn>
      </form>
    </v-container>
    <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i>
    <v-snackbar
      :timeout=5000
      v-model="snackbar"
      color= snackbarColor
    >{{ message }}
    </v-snackbar>
  </v-container>
</template>
<script>
import axios from 'axios';
import config from '../config';
import collection from './collection';

export default {
  name: 'collectionList',
  data() {
    return {
      loading: false,
      privateCollections: [
      ],
      publicCollections: [
      ],
      groups: [
        { title: 'group1', id: 'jfkd33jf88nvn884ng8n26nr6', members: [] },
      ],
      newPrivateCollectionCard: false,
      newPublicCollectionCard: false,
      newCollection: {
        title: null,
        description: null,
        visibility: '',
      },
      message: '',
      snackbar: false,
      snackbarColor: 'green',
    };
    // eslint-disable-line no-underscore-dangle
  },
  components: {
    collection,
  },
  methods: {
    getUserId() {
      let id;
      if (this.$store.state.user._id) { // eslint-disable-line no-underscore-dangle
        id = this.$store.state.user._id; // eslint-disable-line no-underscore-dangle
      } else {
        id = null;
      }
      return id;
    },
    addPrivateCollectionCard() {
      this.newPrivateCollectionCard = true;
      this.newCollection.visibility = 'private';
    },
    addPublicCollectionCard() {
      this.newPublicCollectionCard = true;
      this.newCollection.visibility = 'public';
    },
    createCollection() {
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections`;
      const newCollection = this.newCollection;
      newCollection.user = this.getUserId();
      // console.log('new collection:: ', newCollection.title, newCollection.description);
      axios.post(url, { newCollection },
        {
          headers: { 'x-access-token': this.$store.state.token },
        }).then(() => {
          this.message = 'Προστέθηκε μία συλλογή!';
          this.snackbarColor = 'green';
          this.snackbar = true;
          if (this.newCollection.visibility === 'public') {
            this.loadPublicCollections();
            this.newPublicCollectionCard = false;
          } else {
            this.loadPrivateCollections();
            this.newPrivateCollectionCard = false;
          }
          this.newCollection.title = '';
          this.newCollection.description = '';
          this.newCollection.visibility = '';
        });
    },
    loadPrivateCollections() {
      // console.log('loading collections');
      this.loading = true;
      if (this.$store.state.privateCollections.length > 0) {
        this.privateCollections = this.$store.state.privateCollections;
      }
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections`;
      axios.get(url, {
        params: {
          userId: this.getUserId(),
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        this.privateCollections = response.data;
      }).then(() => {
        this.loading = false;
        this.$store.dispatch('setPrivateCollections', this.privateCollections);
      });
    },
    loadPublicCollections() {
      // console.log('loading collections');
      this.loading = true;
      if (this.$store.state.publicCollections.length > 0) {
        this.publicCollections = this.$store.state.publicCollections;
      }
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/public/collections`;
      axios.get(url, {
      }).then((response) => {
        this.publicCollections = response.data;
      }).then(() => {
        this.loading = false;
        this.$store.dispatch('setPublicCollections', this.publicCollections);
      });
    },
  },
  mounted() {
    this.loading = true;
    if (this.$store.state.isUserLoggedIn) {
      this.loadPrivateCollections();
    }
    this.loadPublicCollections();
    this.$on('refreshprivatecollections', () => {
      this.loadPrivateCollections();
    });
    this.$on('refreshpubliccollections', () => {
      this.loadPublicCollections();
    });
  },
};
</script>
<style>
#collectionList {
  color: black;
  max-height: 82vh;
  width: 100vh;
  overflow-y: scroll;
}
</style>
