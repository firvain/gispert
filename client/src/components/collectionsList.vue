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
    </v-container>

    <v-subheader inset>Δημόσιες Συλλογές</v-subheader>
    <v-container fluid>
      <v-list
        v-for="collection in publicCollections"
        :key="collection.id"
      >
        <collection :collection='collection'></collection>
      </v-list>
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
        { title: 'kozani test1', description: 'test', id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test2', description: 'test', id: 'jfjkdlaiefjie37492jfiosf98w' },
      ],
      publicCollections: [
        { title: 'kozani test public1', description: 'test', id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public2', description: 'test', id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public3', description: 'test', id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public1', description: 'test', id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public2', description: 'test', id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public3', description: 'test', id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public1', description: 'test', id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public2', description: 'test', id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public3', description: 'test', id: 'jfjkdlaiefjie37492jfiosf98w' },
      ],
      groups: [
        { title: 'group1', id: 'jfkd33jf88nvn884ng8n26nr6', members: [] },
      ],
    };
  },
  components: {
    collection,
  },
  methods: {
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
