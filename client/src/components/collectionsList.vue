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
    </v-container>

    <v-subheader inset>Δημόσιες Συλλογές</v-subheader>
    <v-container fluid>
      <v-list
        v-for="collection in publicCollections"
        :key="collection.id"
      >
        <collection :collection='collection'></collection>
      </v-list>
      <p v-if="publicCollections.length == 0">Δεν υπάρχουν δημόσιες συλλογές. Πρόσθεσε μία πατώντας
        <v-btn fab dark outline small color="green" @click="addPublicCollectionCard">
          <v-icon dark>add</v-icon>
        </v-btn>
      </p>
    </v-container>
  </v-container>
</template>
<script>
import axios from 'axios';
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

    },
  },
  mounted() {
    this.loading = true;
    axios.get('https://calm-gorge-20681.herokuapp.com/api/users/all').then((response) => {
      this.users = response.data;
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
