<template>
  <div id='home'>
    <v-layout row wrap>
      <timeline></timeline>
    </v-layout>
  </div>
</template>
<script>
import timeline from './timeline';

export default {
  name: 'home',
  data: () => ({
  }),
  components: {
    timeline,
  },
};
</script>
<style>
</style>
