<template>
  <v-container id='collectionList'>
    <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i>
    <v-subheader inset>Προσωπικές Συλλογές</v-subheader>
    <v-container fluid>
      <v-list
        v-for="collection in privateCollections"
        :key="collection.id"
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
        <v-btn @click="createCollection">submit</v-btn>
        <v-btn @click="newPrivateCollectionCard = false">cancel</v-btn>
      </form>
      {{ newCollection.title }}, {{ newCollection.description }}
    </v-container>

    <v-subheader inset>Δημόσιες Συλλογές</v-subheader>
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
    </v-container>
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
      },
      message: '',
      snackbar: false,
      snackbarColor: 'green',
    };
  },
  components: {
    collection,
  },
  methods: {
    addPrivateCollectionCard() {
      this.newPrivateCollectionCard = true;
    },
    addPublicCollectionCard() {
      this.newPublicCollectionCard = true;
    },
    createCollection() {
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections`;
      const newCollection = this.newCollection;
      console.log('new collection:: ', newCollection.title);
      axios.post(url, { newCollection }).then((response) => {
        this.privateCollections = response.data;
      }).then(() => {
        this.message = 'Προστέθηκε μία συλλογή!';
        this.snackbarColor = 'green';
        this.snackbar = true;
      });
    },
  },
  mounted() {
    this.loading = true;
    const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections`;
    axios.get(url).then((response) => {
      this.privateCollections = response.data;
    }).then(() => {
      this.loading = false;
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
