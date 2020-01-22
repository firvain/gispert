<template>
  <v-tabs v-model="$store.state.activeTab" grow icons centered>
    <v-tabs-slider color="red"></v-tabs-slider>
    <v-tab href="#home" ripple>
      <v-icon>timeline</v-icon>
      <b>{{ $t("message.timeline") }}</b>
    </v-tab>
    <v-tab href="#explore" ripple>
      <v-icon>search</v-icon>
      <b>{{ $t("message.explore") }}</b>
    </v-tab>
    <!-- <v-tab href="#users" ripple>
        <v-icon>fa-user-o</v-icon>
        <b>{{ $t("message.users") }}</b>
      </v-tab> -->
    <v-tab href="#questionnaires" ripple>
      <v-icon>live_help</v-icon>
      <b>{{ $t("message.questionnaires") }}</b>
    </v-tab>
    <v-tabs-items>
      <v-tab-item value="home">
        <timeline></timeline>
      </v-tab-item>
      <v-tab-item value="explore">
        <explore></explore>
      </v-tab-item>
      <!-- <v-tab-item
        value="users"
      >
        <userList></userList>
      </v-tab-item> -->
      <v-tab-item value="questionnaires">
        <questionnaires></questionnaires>
      </v-tab-item>
    </v-tabs-items>
  </v-tabs>
</template>

<script>
import timeline from "@/components/timeline";
import explore from "@/components/search";
// import userList from '@/components/userlist';
import questionnaires from "@/components/questionnaires";

export default {
  name: "Tabs",
  components: {
    timeline,
    explore,
    questionnaires
  },
  data: () => ({}),
  computed: {
    active() {
      return this.$store.state.activeTab;
    }
  },
  watch: {
    "$store.state.activeTab": function() {
      console.log("active changed");
      this.changeTab();
    }
  },
  mounted() {
    this.$store.commit("setQuestionnaireMode", null);
  },
  methods: {
    changeTab() {
      console.log("change tab");
      this.$store.commit("setActiveTab", this.active);
    }
  }
};
</script>
<style>
.tabs__content {
  min-height: 100vh;
}
</style>
