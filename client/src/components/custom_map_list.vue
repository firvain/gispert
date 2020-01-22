<template>
  <v-container id="mapList">
    <v-layout v-if="$store.state.isUserLoggedIn" row wrap>
      <v-flex md8>
        <v-text-field
          v-model="searchMaps"
          name="search-input"
          :label="$t('message.search')"
          :hint="$t('message.searchHint')"
          min="4"
          append-icon="search"
        ></v-text-field>
      </v-flex>
      <v-flex md4>
        <v-btn fab outline @click="searchCustomMaps">
          <v-icon color="green lighten-1">search</v-icon>
        </v-btn>
        <v-btn fab outline @click="mode = 'normal'">
          <v-icon color="green lighten-1">clear</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-container
      v-if="mode === 'normal'"
      v-bind="{ [`grid-list-${size}`]: true }"
    >
      <v-layout v-if="mode === 'normal'" row wrap>
        <!-- <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i> -->
        <v-progress-linear
          v-show="loading"
          :indeterminate="true"
        ></v-progress-linear>
        <v-flex
          v-for="customMap in this.$store.state.customMaps"
          :key="customMap.id"
          md12
          sm12
        >
          <customMap :custom-map="customMap" @explore="explore"> </customMap>
        </v-flex>
        <v-btn
          v-if="$store.state.isUserLoggedIn && mode === 'normal'"
          block
          @click="nextPageLoadMaps"
        >
          {{ $t("message.loadMore") }}
          <v-icon right dark>navigate_next</v-icon>
        </v-btn>
      </v-layout>
    </v-container>
    <v-container v-else-if="mode === 'search'" fluid>
      <v-subheader
        v-if="
          this.$store.state.isUserLoggedIn &&
            openedCollection === null &&
            mode === 'search'
        "
        inset
      >
        {{ $t("message.searchResults") }}
      </v-subheader>
      <v-flex
        v-for="customMap in searchResultcustomMaps"
        :key="customMap.id"
        md12
        sm12
      >
        <customMap :custom-map="customMap" @explore="explore"> </customMap>
      </v-flex>
    </v-container>
  </v-container>
</template>
<script>
import axios from "axios";
import config from "../config";
import customMap from "./custom_map";
import cardDetails from "./card_in_details";

export default {
  name: "CustomMaplist",
  components: {
    customMap,
    cardDetails
  },
  data() {
    return {
      // customMaps: [],
      size: "xl",
      expand: "md12",
      explore_estate: null,
      loading: false,
      searchMaps: "",
      page: 25,
      mode: "normal",
      searchResultcustomMaps: []
    };
  },
  mounted() {
    if (this.$store.state.customMaps.length === 0) {
      this.loadMaps();
    }

    this.$eventHub.$on("logged-in", () => {
      if (this.$store.state.customMaps.length === 0) {
        this.loadMaps();
      }
    });
  },
  methods: {
    explore(estate) {
      this.mode = 1;
      this.explore_estate = estate;
      return estate;
    },
    loadMaps() {
      if (this.$store.state.isUserLoggedIn) {
        this.$store.dispatch("setCustomMaps", "empty");
        this.loading = true;
        const url = `${config.url}/fileLayers`;
        axios
          .get(url, {
            params: {
              pageFrom: 0,
              pageTo: 25
            },
            headers: { "x-access-token": this.$store.state.token }
          })
          .then(response => {
            if (response.data.success === false) {
              console.log("not logged in to see maps");
            } else {
              console.log("setting custom maps to vuex");
              this.$store.dispatch("setCustomMaps", response.data);
            }
          })
          .then(() => {
            this.loading = false;
          });
      }
    },
    nextPageLoadMaps() {
      this.loading = true;
      const url = `${config.url}/fileLayers`;
      axios
        .get(url, {
          params: {
            pageFrom: this.page,
            pageTo: this.page + 25
          },
          headers: { "x-access-token": this.$store.state.token }
        })
        .then(response => {
          if (response.data.success === false) {
            console.log("not logged in to see maps");
          } else {
            this.$store.dispatch("setCustomMaps", response.data);
          }
        })
        .then(() => {
          this.loading = false;
        });
    },
    searchCustomMaps() {
      this.mode = "search";
      this.loading = true;
      const url = `${config.url}/fileLayers/search`;
      axios
        .get(url, {
          params: {
            keyword: this.searchMaps
          },
          headers: { "x-access-token": this.$store.state.token }
        })
        .then(response => {
          if (response.data.success === true) {
            this.searchResultcustomMaps = response.data;
          }
        })
        .then(() => {
          this.loading = false;
        });
    }
  }
};
</script>
<style>
#mapList {
  color: black;
  max-height: 82vh;
  overflow-y: scroll;
}
</style>
