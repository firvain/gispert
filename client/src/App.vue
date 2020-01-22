<template>
  <div id="app">
    <v-app>
      <Pageheader></Pageheader>
      <router-view></router-view>
    </v-app>
  </div>
</template>

<script>
import Pageheader from "@/components/pageheader";

export default {
  name: "App",
  components: {
    Pageheader
  },
  data() {
    return {};
  }
};
</script>
<style>
body {
  margin-bottom: 0px !important;
}
</style>
