<template>
  <div>
    <v-card flat height="0px">
      <v-toolbar class="white" absolute dense offset-xs2>
        <v-layout class="text-xs-center" v-if="selectedTool === 'selectFeatures' && currentlySelectedFeature != undefined && this.$store.state.isUserLoggedIn">
          <!-- <br><br> -->
          <!-- <v-tooltip bottom>
            <v-btn fab small :color="toolColors[2]" slot="activator" @click="addToPost()">
              <v-icon dark>loupe</v-icon>
            </v-btn>
            <span>Πρόσθεσέ το στην ανάρτηση</span>
          </v-tooltip> -->
          <v-tooltip bottom>
            <v-btn fab small :color="toolColors[2]" slot="activator" @click="setDraw('contains')">
              <v-icon dark>explore</v-icon>
            </v-btn>
            <span>Δες σχετικές αναρτήσεις</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn fab small :color="toolColors[2]"
              v-if="$store.state.feature.getGeometry().getType() === 'Polygon' || $store.state.feature.getGeometry().getType() === 'LineString'"
              slot="activator" @click="measure()">
              <v-icon dark>straighten</v-icon>
            </v-btn>
            <span>Μέτρησέ το</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn fab small :color="toolColors[0]" slot="activator" @click="deleteFeature()">
              <v-icon dark>delete</v-icon>
            </v-btn>
            <span>Διέγραψέ το</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn fab small :color="toolColors[0]"
              v-if="$store.state.feature.getGeometry().getType() === 'Point'"
              slot="activator" @click="createBufferDialog = true;">
              <v-icon dark>panorama_fish_eye</v-icon>
            </v-btn>
            <span>Βρες τη ζώνη επιρροής</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn fab small :color="toolColors[1]"
              v-if="$store.state.feature.getGeometry().getType() === 'Polygon'"
              slot="activator" @click="setDraw('Union')">
              <v-icon dark>flip_to_back</v-icon>
            </v-btn>
            <span>Ένωσέ το με ένα άλλο</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn fab small :color="toolColors[2]"
              v-if="$store.state.feature.getGeometry().getType() === 'Polygon'"
              slot="activator" @click="setDraw('Clip')">
              <v-icon dark>layers</v-icon>
            </v-btn>
            <span>Βρες κοινή περιοχή με ένα άλλο</span>
          </v-tooltip>
          <!-- <v-tooltip bottom>
            <v-btn fab small :color="toolColors[2]" slot="activator" @click="chatOnThisFeature()">
              <v-icon dark>send</v-icon>
            </v-btn>
            <span>Στείλτο σε άλλους χρήστες</span>
          </v-tooltip> -->
        </v-layout>
      </v-toolbar>

    </v-card>
    <v-dialog v-model="userSelector" scrollable max-width="300px"> 
      <userSelector v-show="userSelector" :active = 'userSelector'></userSelector>
    </v-dialog>
    <v-dialog v-model="createBufferDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span>Απόσταση;</span>
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-actions>
          <v-text-field
            name="distance"
            label="Απόσταση"
            v-model="bufferDistance"
          ></v-text-field>          
          <v-btn color="primary" flat @click.stop="createBufferDialog=false">Κλείσιμο</v-btn>
          <v-btn color="primary" flat @click.stop="createBuffer()">Εκτέλεση</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogMeasurements" max-width="500" color='white'>
      <v-card>
        <v-card-title>{{ measurement }}</v-card-title>
        <v-btn color="primary" flat @click.stop="dialogMeasurements=false">Κλείσιμο</v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import ol from 'openlayers';
import axios from 'axios';
import turf from 'turf';
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
    toggle_map_tools(tool) {
      if (tool === 'selectFeatures') {
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
      if (tool === 'drawFeatures') {
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
    createBuffer() {
      const geojsonFormat = new ol.format.GeoJSON();
      const units = 'kilometers';
      const point = turf.point(this.$store.state.feature.getGeometry().getCoordinates());
      console.log(point);
      const buffer = turf.buffer(point, this.bufferDistance * 100, units);
      console.log(buffer);
      const g = geojsonFormat.readFeatures(buffer);
      g[0].setProperties({
        mongoID: `${this.$store.state.user._id} ${Date.now()}`, // eslint-disable-line no-underscore-dangle
        name: `@${this.$store.state.user.name}`,
        userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
      });
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach((layer) => {
        if (layer.getProperties().name === 'customLayer') {
          layer.getSource().addFeatures(g);
        }
      });
    },
    measure() {
      const geojsonFormat = new ol.format.GeoJSON();
      const g = geojsonFormat.writeFeatureObject(this.$store.state.feature);
      const units = 'kilometers';
      if (this.$store.state.feature.getGeometry().getType() === 'Polygon') {
        console.log('area:: ', turf.area(g));
        this.dialogMeasurements = true;
        this.measurement = `${Math.round(turf.area(g) / 10000000000)} m2`;
      }
      if (this.$store.state.feature.getGeometry().getType() === 'LineString') {
        console.log('length:: ', turf.lineDistance(g, units));
        this.dialogMeasurements = true;
        this.measurement = `${Math.round(turf.lineDistance(g, units)) / 100} m`;
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
