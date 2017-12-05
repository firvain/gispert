<template>
  <v-layout>
    <v-flex xs12 sm12>
      <v-card>
        <v-card-title primary-title>
          <div>
              <p class="text-xs-left" md12 v-if="user.name"><b>@{{user.name}}</b>{{user.description}}</p>
          </div>
        </v-card-title>
        <v-card-actions class="white">
          <v-spacer></v-spacer>
          <v-card-actions>
            <v-btn class="green white--text darken-1" @click="explore">Δες τις αναρτήσεις του</v-btn>
          </v-card-actions>
          <v-card-actions>
            <v-btn class="green white--text darken-1" @click="explore">Live</v-btn>
          </v-card-actions>
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
