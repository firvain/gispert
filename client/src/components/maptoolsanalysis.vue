<template>
  <div>
    <v-card flat height="0px">
      <!-- <v-toolbar class="white" absolute dense offset-xs2> -->
        <v-flex class="text-xs-center" v-if="selectedTool === 'selectFeatures' && currentlySelectedFeature != undefined && this.$store.state.isUserLoggedIn">
          <!-- <br><br> -->
          <!-- <v-tooltip bottom>
            <v-btn fab small :color="toolColors[2]" slot="activator" @click="addToPost()">
              <v-icon dark>loupe</v-icon>
            </v-btn>
            <span>Πρόσθεσέ το στην ανάρτηση</span>
          </v-tooltip> -->
          <v-flex pa-0 ma-0>
          <v-tooltip bottom>
            <v-btn class='verysmall' icon :color="toolColors[2]" slot="activator" @click="exploreFeaturePosts()">
              <v-icon class='verysmallicon' dark>explore</v-icon>
            </v-btn>
            <span>Δες σχετικές αναρτήσεις</span>
          </v-tooltip>
          </v-flex>
          <!-- <v-tooltip bottom>
            <v-btn fab small :color="toolColors[2]" slot="activator" @click="postUsingFeature()">
              <v-icon class='verysmallicon' dark>explore</v-icon>
            </v-btn>
            <span>Απάντησε</span>
          </v-tooltip> -->
          <v-tooltip bottom>
            <v-btn class='verysmall' icon :color="toolColors[2]"
              v-if="$store.state.feature.getGeometry().getType() === 'Polygon' || $store.state.feature.getGeometry().getType() === 'LineString'"
              slot="activator" @click="measure()">
              <v-icon class='verysmallicon' dark>straighten</v-icon>
            </v-btn>
            <span>Μέτρησέ το</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn class='verysmall' icon :color="toolColors[0]" slot="activator" @click="deleteFeature()">
              <v-icon class='verysmallicon' dark>delete</v-icon>
            </v-btn>
            <span>Διέγραψέ το</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn class='verysmall' icon :color="toolColors[0]"
              v-if="$store.state.feature.getGeometry().getType() === 'Point'"
              slot="activator" @click="createBufferDialog = true;">
              <v-icon class='verysmallicon' dark>panorama_fish_eye</v-icon>
            </v-btn>
            <span>Βρες τη ζώνη επιρροής</span>
          </v-tooltip>
          <!-- <v-tooltip bottom>
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
          </v-tooltip> -->
          <!-- <v-tooltip bottom>
            <v-btn fab small :color="toolColors[2]" slot="activator" @click="chatOnThisFeature()">
              <v-icon dark>send</v-icon>
            </v-btn>
            <span>Στείλτο σε άλλους χρήστες</span>
          </v-tooltip> -->
        </v-flex>
      <!-- </v-toolbar> -->

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
// import axios from 'axios';
import turf from 'turf';
// import config from '../config';
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
        olMap.setActiveInteraction('select');
      }
      if (tool === 'drawFeatures') {
        this.selectColor = 'white';
        this.drawColor = 'green';
        olMap.setActiveInteraction('Point');
      }
    },
    // postUsingFeature() {},
    // addToPost() {
    //   console.log(this.$store.state.feature);
    //   this.$store.commit('newPostFeature', this.$store.state.feature);
    // },
    deleteFeature() {
      this.$store.commit('setSelected', undefined);
      olMap.removeFeaturesFromLayer('customLayer', 'mongoID', this.$store.state.featureId);
    },
    exploreFeaturePosts() {
      this.$store.state.activeTab = 'explore';
      this.$eventHub.$emit('openFeaturePosts', this.$store.state.featureId);
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
    // chatOnThisFeature() {
    //   this.userSelector = true;
    // },
  },
};
</script>
<style>
.overflowing {
  z-index: 99;
}
 .verysmall{
   width: 30px;
   height: 30px;
   padding: 0px;
   margin: 0px;
 }
 .verysmallicon{
   width: 10px;
   padding: 0px;
   margin: 0px;
 }
</style>
