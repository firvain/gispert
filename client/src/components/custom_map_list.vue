<template>
  <div id='mapList'>
    <v-container v-bind="{ [`grid-list-${size}`]: true }" v-if="mode === 0">
    <v-layout row wrap v-if="$store.state.isUserLoggedIn">
      <v-flex md8>
        <v-text-field
          name="search-input"
          label="Αναζήτηση"
          hint="Τουλάχιστον 4 χαρακτήρες"
          v-model="searchMaps"
          min="4"
          append-icon="search"
        ></v-text-field>
      </v-flex>
      <v-flex md4>
        <v-btn fab outline v-on:click='mode = 0'>
          <v-icon color="green lighten-1">search</v-icon>
        </v-btn>
        <v-btn fab outline v-on:click='mode = 0'>
          <v-icon color="green lighten-1">clear</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
      <v-layout row wrap>
        <!-- <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i> -->
        <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
        <v-flex
          md12 sm12
          v-for="customMap in this.$store.state.customMaps"
          :key="customMap.id"
        >
          <customMap :customMap='customMap' @explore="explore">
          </customMap>
        </v-flex>
        <v-btn
          v-if="$store.state.isUserLoggedIn"
          v-on:click='nextPageLoadMaps'
          class="blue-grey white--text"
          block
        >
          φορτωση περισσότερων
          <v-icon right dark>navigate_next</v-icon>
        </v-btn>
      </v-layout>
    </v-container>
    <v-container fluid v-else-if='mode === 1'>
      <v-btn round warning dark ripple raised large v-on:click='mode = 0'>
        <i class="fa fa-close fa-lg"> Close</i>
      </v-btn>
      <cardDetails v-bind:customMap="explore_estate"></cardDetails>
      <v-btn round warning dark ripple raised large v-on:click='mode = 0'>
        <i class="fa fa-close fa-lg"> Close</i>
      </v-btn>
    </v-container>
  </div>
</template>
<script>
import axios from 'axios';
import config from '../config';
import customMap from './custom_map';
import cardDetails from './card_in_details';

export default {
  name: 'customMaplist',
  data() {
    return {
      // customMaps: [],
      size: 'xl',
      expand: 'md12',
      mode: 0,
      explore_estate: null,
      loading: false,
      searchMaps: '',
      page: 25,
    };
  },
  components: {
    customMap, cardDetails,
  },
  methods: {
    explore(estate) {
      this.mode = 1;
      this.explore_estate = estate;
      return estate;
    },
    loadMaps() {
      if (this.$store.state.isUserLoggedIn) {
        this.loading = true;
        const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/fileLayers`;
        axios.get(url, {
          params: {
            pageFrom: 0,
            pageTo: 25,
          },
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          if (response.data.success === false) {
            console.log('not logged in to see maps');
          } else {
            this.$store.dispatch('setCustomMaps', response.data);
          }
        }).then(() => {
          this.loading = false;
        });
      }
    },
    nextPageLoadMaps() {
      this.loading = true;
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/fileLayers`;
      axios.get(url, {
        params: {
          pageFrom: this.page,
          pageTo: this.page + 25,
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        if (response.data.success === false) {
          console.log('not logged in to see maps');
        } else {
          this.$store.dispatch('setCustomMaps', response.data);
        }
      }).then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.$store.dispatch('setCustomMaps', 'empty');
    this.loadMaps();
    this.$eventHub.$on('logged-in', () => {
      this.loadMaps();
    });
  },
};
</script>
<style>
#mapList {
  color: black;
  max-height: 82vh;
  overflow-y: scroll;
}
</style>
