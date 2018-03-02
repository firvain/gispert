<template>
  <v-layout>
    <v-flex xs12 sm12>
      <v-card>
        <v-card-title primary-title height="100px">
          <v-btn large flat class="text-xs-left" md12 v-if="user.name" @click="explore">@{{user.name}}</v-btn>
        </v-card-title>
        <v-card-text v-if="user.description">
          {{user.description}}
        </v-card-text>
        <v-card-actions class="grey lighten-3">
          <v-switch
            slot="activator"
            label= "Ζωντανή μετάδοση"
            v-model="showLive"
            color="success"
          ></v-switch>          
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <v-select
              slot="activator"
              label="Επιλογή"
              :items="userCollections"
              item-text="title"
              item-value="_id"
              v-model="selectedCollections"
              multiple
              max-height="400"
              hint="Διάλεξε ποιες συλλογές θα παρακολουθείς"
              persistent-hint
              v-on:change="listChanged = true"
            ></v-select>
            <span>Δες τις δημόσιες συλλογές και ακολούθα τες</span>
          </v-tooltip>
          <v-btn fab outline small v-if="listChanged" @click="addMembershipToCollections()">
            <v-icon color="green lighten-1">save</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import axios from 'axios';
import config from '../config';

export default {
  props: ['user'],
  name: 'user',
  data: () => ({
    showLive: true,
    userCollections: [],
    selectedCollections: [],
    listChanged: false,
  }),
  methods: {
    explore() {
      this.$emit('explore', this.user);
    },
    addMembershipToCollections() {
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections/addmember`;
      const data = {
        memberId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        collectionsId: this.selectedCollections,
      };
      axios.post(url, { data }, {
        headers: { 'x-access-token': this.$store.state.token },
      })
      .then(() => {
        console.log('mark as followed and notify user');
      });
    },
  },
  mounted() {
    this.userCollections = this.user.collectionData;
  },
};
</script>
