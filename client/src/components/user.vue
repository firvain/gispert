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
              v-model="selectedCollections"
              multiple
              max-height="400"
              hint="Διάλεξε ποιες συλλογές θα παρακολουθείς"
              persistent-hint
            ></v-select>
            <span>Δες τις δημόσιες συλλογές και ακολούθα τες</span>
          </v-tooltip>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  props: ['user'],
  name: 'user',
  data: () => ({
    showLive: true,
    userCollections: [],
    selectedCollections: [],
  }),
  methods: {
    ...mapActions(['addToCompare']),
    explore() {
      this.$emit('explore', this.user);
    },
    isInCompare(id) {
      const exists = this.results.find(p => p === id);
      let listButtonColor;
      if (exists === id) {
        listButtonColor = true;
      } else {
        listButtonColor = false;
      }
      return listButtonColor;
    },
  },
  computed: {
    ...mapGetters({
      results: 'cartEstates',
    }),
  },
};
</script>
