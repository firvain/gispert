<template>
  <div>
    <v-tabs dark grow icons centered>
      <v-tabs-bar class="orange">
        <v-tabs-slider color="yellow"></v-tabs-slider>
        <v-tabs-item :to="{name: 'home'}">
          <v-icon>timeline</v-icon>
          Χρονολόγιο
        </v-tabs-item>
        <v-tabs-item :to="{name: 'search'}">
          <v-icon>search</v-icon>
          Αναζήτηση
        </v-tabs-item>
        <v-tabs-item :to="{name: 'customMaps'}">
          <v-icon>map</v-icon>
          Χάρτες
        </v-tabs-item>
        <v-tabs-item :to="{name: 'userList'}">
          <v-icon>fa-user-o</v-icon>
          Χρήστες
        </v-tabs-item>
      </v-tabs-bar>
    </v-tabs>
    <v-tabs-items>
        <router-view></router-view>
    </v-tabs-items>
  </div>
</template>

<script>
export default {
  name: 'tabs',
  components: {
  },
  data: () => ({
  }),
};
</script>
<style>
</style>
