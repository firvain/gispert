<template>
  <div id='mapList'>
    <v-container v-bind="{ [`grid-list-${size}`]: true }" v-if="mode === 0">
      <v-layout row wrap>
        <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i>
        <v-flex
          md12
          v-for="customMap in customMaps"
          :key="customMap.id"
        >
          <customMap :customMap='customMap' @explore="explore">
          </customMap>
        </v-flex>
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
      customMaps: [],
      size: 'xl',
      expand: 'md12',
      mode: 0,
      explore_estate: null,
      loading: false,
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
  },
  mounted() {
    // TODO this.$route.path split by / get the last item and load the map
    // console.log(this.$route.path);
    this.loading = true;
    const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/fileLayers`;
    axios.get(url, {
      headers: { 'x-access-token': this.$store.state.token },
    }).then((response) => {
      if (response.data.success === false) {
        console.log('not logged in to see maps');
      } else {
        this.customMaps = response.data;
      }
    }).then(() => {
      this.loading = false;
    });
  },
};
</script>
<style>
#mapList {
  color: black;
}
</style>
