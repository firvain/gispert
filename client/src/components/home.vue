<template>
  <div id='home'>
    <v-layout row wrap>
      <timeline></timeline>
    </v-layout>
  </div>
</template>
<script>
// import axios from 'axios';
import timeline from './timeline';
// import config from '../config';

export default {
  name: 'home',
  data: () => ({
    post: null,
  }),
  components: {
    timeline,
  },
  mounted() {
  },
};
</script>
<style>
</style>
