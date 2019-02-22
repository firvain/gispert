<template>
  <v-tabs dark grow icons centered v-model="$store.state.activeTab">
    <v-tabs-bar class="blue-grey">
      <v-tabs-slider color="red"></v-tabs-slider>
      <v-tabs-item href="#home" active-class="blue-grey lighten" class="blue-grey lighten-3" ripple>
        <v-icon>timeline</v-icon>
        <b>{{ $t("message.timeline") }}</b>
      </v-tabs-item>
      <v-tabs-item href="#explore" active-class="blue-grey lighten" class="blue-grey lighten-3" ripple>
        <v-icon>search</v-icon>
        <b>{{ $t("message.explore") }}</b>
      </v-tabs-item>
      <v-tabs-item href="#users" active-class="blue-grey lighten" class="blue-grey lighten-3" ripple>
        <v-icon>fa-user-o</v-icon>
        <b>{{ $t("message.users") }}</b>
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
  }),
  computed: {
    active() {
      return this.$store.state.activeTab;
    },
  },
  watch: {
    '$store.state.activeTab': function () {
      console.log('active changed');
      this.changeTab();
    },
  },
  methods: {
    changeTab() {
      console.log('change tab');
      this.$store.commit('setActiveTab', this.active);
    },
  },
  mounted() {
    this.$store.commit('setQuestionnaireMode', false);
  },
};
</script>
<style>
</style>
