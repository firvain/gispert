<template>
  <timeline></timeline>
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
