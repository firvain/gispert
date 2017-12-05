<template>
  <timeline></timeline>
</v-container>

</template>
<script>
import timeline from './timeline';

export default {
  name: 'search',
  data() {
    return {
      ex1: [],
      ex2: [],
      amenities: [],
      e3: null,
      e4: null,
      e2: 3,
      modal: false,
      chip2: true,
      mode: 0,
    };
  },
  components: {
    timeline,
  },
};
</script>
<style>
.fa-bed {
  padding: 2px;
  align-items: center;
  align: center;
}
.flex-beds {
  align-items: center;
  align-content: center;
  align-self: center;
}
.query-option {
  padding: 0px;
}
</style>
