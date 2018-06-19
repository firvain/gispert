<template>
  <div>
    <v-card flat height="0px">
      <v-toolbar class="white overflowing" absolute dense offset-xs2>
        <v-tooltip bottom>
          <v-btn fab small slot="activator" @click="$eventHub.$emit('previousFeatures')">
            <v-icon dark>chevron_left</v-icon>
          </v-btn>
          <span>Δες προηγούμενα γεωδεδομένα</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn fab small slot="activator" @click="$eventHub.$emit('nextFeatures')">
            <v-icon dark>chevron_right</v-icon>
          </v-btn>
          <span>Δες επόμενα γεωδεδομένα</span>
        </v-tooltip>

        <v-text-field prepend-icon="search" hide-details single-line></v-text-field>
        <v-btn icon v-bind:color="selectColor" @click="toggle_map_tools('selectFeatures')" v-if="this.$store.state.isUserLoggedIn">
          <v-icon>crop_free</v-icon>
        </v-btn>
        <v-btn icon v-bind:color="drawColor" @click="toggle_map_tools('drawFeatures')" v-if="this.$store.state.isUserLoggedIn">
          <v-icon>location_on</v-icon>
        </v-btn>
      </v-toolbar>

      <v-container class="text-xs-center" v-if="selectedTool === 'drawFeatures' && this.$store.state.isUserLoggedIn">
        <br><br>
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
      </v-container>

      <v-container class="text-xs-center" v-if="selectedTool === 'selectFeatures' && currentlySelectedFeature != undefined && this.$store.state.isUserLoggedIn">
        <br><br>
        <v-tooltip bottom>
          <v-btn fab small :color="toolColors[2]" slot="activator" @click="addToPost()">
            <v-icon dark>loupe</v-icon>
          </v-btn>
          <span>Πρόσθεσέ το στην ανάρτηση</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn fab small :color="toolColors[2]" slot="activator" @click="setDraw('contains')">
            <v-icon dark>explore</v-icon>
          </v-btn>
          <span>Δες σχετικές αναρτήσεις</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn fab small :color="toolColors[2]" slot="activator" @click="setDraw('measure')">
            <v-icon dark>straighten</v-icon>
          </v-btn>
          <span>Μέτρησέ το</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn fab small :color="toolColors[0]" slot="activator" @click="setDraw('Delete')">
            <v-icon dark>delete</v-icon>
          </v-btn>
          <span>Διέγραψέ το</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn fab small :color="toolColors[0]" slot="activator" @click="setDraw('Buffer')">
            <v-icon dark>panorama_fish_eye</v-icon>
          </v-btn>
          <span>Βρες τη ζώνη επιρροής</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn fab small :color="toolColors[1]" slot="activator" @click="setDraw('Union')">
            <v-icon dark>flip_to_back</v-icon>
          </v-btn>
          <span>Ένωσέ το με ένα άλλο</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn fab small :color="toolColors[2]" slot="activator" @click="setDraw('Clip')">
            <v-icon dark>layers</v-icon>
          </v-btn>
          <span>Βρες κοινή περιοχή με ένα άλλο</span>
        </v-tooltip>
        <v-tooltip bottom>
          <v-btn fab small :color="toolColors[2]" slot="activator" @click="chatOnThisFeature()">
            <v-icon dark>send</v-icon>
          </v-btn>
          <span>Στείλτο σε άλλους χρήστες</span>
        </v-tooltip>
      </v-container>
    </v-card>
    <v-dialog v-model="userSelector" scrollable max-width="300px"> 
      <userSelector v-show="userSelector" :active = 'userSelector'></userSelector>
    </v-dialog>
  </div>
</template>
<script>
import ol from 'openlayers';
import userSelector from './selectCloseUsers';
import olMap from '../js/map';

export default {
  name: 'searchLocation',
  components: {
    userSelector,
  },
  data: () => ({
    selectedTool: 'selectFeatures',
    selectColor: 'green',
    drawColor: 'white',
    toolColors: ['white', 'white', 'white'],
    selectedFeature: olMap.selectedFeature,
    activeAnalysis: null,
    userSelector: false,
  }),
  computed: {
    currentlySelectedFeature() {
      return this.$store.state.feature;
    },
  },
  created() {
    this.$root.$on('showTools', () => {
      if (this.selectedTool === 'selectFeatures') {
        this.toggle_map_tools('drawFeatures');
      }
    });
    this.$eventHub.$on('drawEnd', () => {
      this.toggle_map_tools('selectFeatures');
    });
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
