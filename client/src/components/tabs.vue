<template>
  <v-tabs dark grow icons centered v-model="active">
    <v-tabs-bar class="orange lighten-2">
      <v-tabs-slider color="yellow"></v-tabs-slider>
      <v-tabs-item href="#home">
        <v-icon>timeline</v-icon>
        {{ $t("message.timeline") }}
      </v-tabs-item>
      <v-tabs-item href="#explore">
        <v-icon>search</v-icon>
        {{ $t("message.explore") }}
      </v-tabs-item>
      <v-tabs-item href="#users">
        <v-icon>fa-user-o</v-icon>
        {{ $t("message.users") }}
      </v-tabs-item>
    </v-tabs-bar>
    <v-tabs-items>
      <v-tabs-content
        id="home"
      >
        <timeline></timeline>
      </v-tabs-content>
      <v-tabs-content
        id="explore"
      >
      <explore></explore>
      </v-tabs-content>
      <v-tabs-content
        id="users"
      >
      <userList></userList>
      </v-tabs-content>
    </v-tabs-items>
  </v-tabs>
</template>


<script>
import timeline from '@/components/timeline';
import explore from '@/components/search';
import userList from '@/components/userlist';

export default {
  name: 'tabs',
  components: {
    timeline, explore, userList,
  },
  data: () => ({
    active: null,
  }),
};
</script>
<style>
</style>
