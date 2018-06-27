<template>
  <div id='home'>
    <timeline></timeline>
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
  #home {
    color: black;
    max-height: 82vh;
    overflow-y: scroll;
  }
</style>
