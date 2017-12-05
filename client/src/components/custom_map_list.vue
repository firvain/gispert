<template>
  <div id='timeline'>
    <v-container v-bind="{ [`grid-list-${size}`]: true }" v-if="mode === 0">
      <v-layout row wrap>
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
    axios.get('https://calm-gorge-20681.herokuapp.com/api/fileLayers').then((response) => {
      this.customMaps = response.data;
    });
  },
};
</script>
<style>
#timeline {
  color: black;
}
</style>
