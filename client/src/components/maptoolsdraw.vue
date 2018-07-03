<template>
  <div>
    <v-layout class="text-xs-center" v-if="selectedTool === 'drawFeatures' && this.$store.state.isUserLoggedIn">
      <v-tooltip bottom>
        <v-btn fab small :color="toolColors[0]" slot="activator" @click="setDraw('Point')">
          <v-icon dark>location_on</v-icon>
        </v-btn>
        <span>Βάλε στο χάρτη ένα σημείο</span>
      </v-tooltip>
      <v-tooltip bottom>
      <v-btn fab small :color="toolColors[1]" slot="activator" @click="setDraw('LineString')">
        <v-icon dark>linear_scale</v-icon>
      </v-btn>
        <span>Βάλε στο χάρτη μία γραμμή</span>
      </v-tooltip>
      <v-tooltip bottom>
      <v-btn fab small :color="toolColors[2]" slot="activator" @click="setDraw('Polygon')">
        <v-icon dark>rounded_corner</v-icon>
      </v-btn>
        <span>Βάλε στο χάρτη ένα πολύγωνο</span>
      </v-tooltip>
    </v-layout>
  </div>
</template>
<script>
import ol from 'openlayers';
import axios from 'axios';
import config from '../config';
import userSelector from './selectCloseUsers';
import olMap from '../js/map';

export default {
  name: 'mapTools',
  components: {
    userSelector,
  },
  data: () => ({
    selectColor: 'green',
    drawColor: 'white',
    toolColors: ['white', 'white', 'white'],
    selectedFeature: olMap.selectedFeature,
    activeAnalysis: null,
    userSelector: false,
    createBufferDialog: false,
    bufferDistance: 500,
    measurement: '',
    dialogMeasurements: false,
  }),
  computed: {
    currentlySelectedFeature() {
      return this.$store.state.feature;
    },
    selectedTool: {
      get: function handle() {
        return this.$store.state.activeMapTool;
      },
      set: function handle() {
        return 'selectFeatures';
      },
    },
  },
  watch: {
    '$store.state.activeMapTool': function () {
      this.toggle_map_tools(this.selectedTool);
    },
    '$store.state.activeTab': function () {
      this.toggle_map_tools('selectFeatures');
    },
    '$store.state.newpostfeature': function () {
      this.toggle_map_tools('selectFeatures');
    },
  },
  created() {
    // this.$root.$on('showTools', () => {
    //   if (this.selectedTool === 'selectFeatures') {
    //     this.toggle_map_tools('drawFeatures');
    //   }
    // });
    // this.$eventHub.$on('drawEnd', () => {
    //   this.toggle_map_tools('selectFeatures');
    // });
  },
  methods: {
    toggle_map_tools(selectedTool) {
      if (selectedTool === 'selectFeatures') {
        this.selectColor = 'green';
        this.drawColor = 'white';
        olMap.getInteractions().forEach((interaction) => {
          if (interaction instanceof ol.interaction.Select) {
            interaction.setActive(true);
            this.toolColors = ['white', 'white', 'white'];
            this.selectedTool = 'selectFeatures';
          }
          if (interaction instanceof ol.interaction.Draw) {
            interaction.setActive(false);
          }
        });
      }
      if (selectedTool === 'drawFeatures') {
        this.selectColor = 'white';
        this.drawColor = 'green';
        olMap.getInteractions().forEach((interaction) => {
          if (interaction instanceof ol.interaction.Draw && interaction.getProperties().name === 'Point') {
            interaction.setActive(true);
            this.selectedTool = 'drawFeatures';
            this.toolColors = ['green', 'white', 'white'];
          } else if (interaction instanceof ol.interaction.Select) {
            interaction.setActive(false);
          }
        });
      }
    },
    setDraw(type) {
      olMap.getInteractions().forEach((interaction) => {
        if (type === 'Point') {
          this.toolColors = ['green', 'white', 'white'];
        }
        if (type === 'LineString') {
          this.toolColors = ['white', 'green', 'white'];
        }
        if (type === 'Polygon') {
          this.toolColors = ['white', 'white', 'green'];
        }
        if (interaction instanceof ol.interaction.Draw) {
          if (interaction.getProperties().name === type) {
            interaction.setActive(true);
            this.selectedTool = 'drawFeatures';
          } else {
            interaction.setActive(false);
          }
        }
      });
    },
    addToPost() {
      console.log(this.$store.state.feature);
      this.$store.commit('newPostFeature', this.$store.state.feature);
    },
    deleteFeature() {
      // delete in vuex
      // search in vector source and delete from ol3js
      try {
        // axios.post(url, { feature }, { headers: { 'x-access-token': this.$store.state.token } });
        const url = `${config.url}/features/delete`;
        const data = {
          userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
          featureId: this.$store.state.feature.get('mongoID'),
        };
        axios.post(url, { data }, { headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          console.log('response status:: ', response.status);
          if (response.status === 200) {
            this.$store.commit('setSelected', undefined);
            console.log('deleted');
          } else {
            console.log('error');
          }
        }).then(() => {
          let allLayers = [];
          allLayers = olMap.getLayers().getArray();
          allLayers.forEach((layer) => {
            if (layer.getProperties().name === 'customLayer') {
              layer.getSource().forEachFeature((feature) => {
                if (feature.get('mongoID') === this.$store.state.featureId) {
                  layer.getSource().removeFeature(feature);
                  olMap.getInteractions().forEach((interaction) => {
                    if (interaction instanceof ol.interaction.Select) {
                      interaction.getFeatures().clear();
                    }
                  });
                }
              });
            }
          });
        });
      } catch (error) {
        console.log(error);
      }
    },
    setActiveAnalysis(type) {
      this.activeAnalysis = type;
      olMap.getInteractions().forEach((interaction) => {
        if (interaction instanceof ol.interaction.Select) {
          interaction.getFeatures();
        }
      });
    },
    chatOnThisFeature() {
      this.userSelector = true;
    },
  },
};
</script>
<style>
.overflowing {
  z-index: 99;
}
</style>
