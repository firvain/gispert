<template>
  <v-tabs grow icons centered v-model="$store.state.activeTab">
      <v-tabs-slider color="red"></v-tabs-slider>
      <v-tab href="#home" ripple>
        <v-icon>timeline</v-icon>
        <b>{{ $t("message.timeline") }}</b>
      </v-tab>
      <v-tab href="#explore" ripple>
        <v-icon>search</v-icon>
        <b>{{ $t("message.explore") }}</b>
      </v-tab>
      <v-tab href="#users" ripple>
        <v-icon>fa-user-o</v-icon>
        <b>{{ $t("message.users") }}</b>
      </v-tab>
    <v-tabs-items>
      <v-tab-item
        value="home"
      >
        <timeline></timeline>
      </v-tab-item>
      <v-tab-item
        value="explore"
      >
        <explore></explore>
      </v-tab-item>
      <v-tab-item
        value="users"
      >
        <userList></userList>
      </v-tab-item>
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
