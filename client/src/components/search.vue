<template>
  <v-layout row>
    <v-flex xs12 sm12>
      <v-card>
        <v-toolbar color="orange" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>
          <v-toolbar-title>Συλλογές</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon>search</v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>add</v-icon>
          </v-btn>
        </v-toolbar>
        <v-list two-line subheader>
          <v-subheader inset>Προσωπικές Συλλογές</v-subheader>
          <v-list-tile avatar v-for="item in privateCollections" v-bind:key="item.title">
            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ item.description }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon ripple>
                <v-icon color="grey lighten-1">info</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
        <v-list two-line subheader>
          <v-subheader inset>Δημόσιες Συλλογές</v-subheader>
          <v-list-tile avatar v-for="item in publicCollections" v-bind:key="item.title">
            <v-list-tile-content style='overflow-y: auto;'>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ item.description }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon ripple>
                <v-icon color="grey lighten-1">info</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import axios from 'axios';
import config from '../config';

export default {
  name: 'search',
  data() {
    return {
      privateCollections: [
        { title: 'kozani test1', description: 'test', flex: 6, id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test2', description: 'test', flex: 6, id: 'jfjkdlaiefjie37492jfiosf98w' },
      ],
      publicCollections: [
        { title: 'kozani test public1', description: 'test', flex: 6, id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public2', description: 'test', flex: 6, id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public3', description: 'test', flex: 6, id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public1', description: 'test', flex: 6, id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public2', description: 'test', flex: 6, id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public3', description: 'test', flex: 6, id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public1', description: 'test', flex: 6, id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public2', description: 'test', flex: 6, id: 'jfjkdlaiefjie37492jfiosf98w' },
        { title: 'kozani test public3', description: 'test', flex: 6, id: 'jfjkdlaiefjie37492jfiosf98w' },
      ],
      groups: [
        { title: 'group1', flex: 6, id: 'jfkd33jf88nvn884ng8n26nr6', members: [] },
      ],
    };
  },
  components: {
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
  },
};
</script>
