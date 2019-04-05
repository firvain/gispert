<template>
  <div>
    <v-layout class="text-xs-center">
      <v-tooltip bottom>
        <v-btn fab flat outline small :color="toolColors[0]" slot="activator" @click="setDraw('Point')">
          <v-icon dark>location_on</v-icon>
        </v-btn>
        <span>Βάλε στο χάρτη ένα σημείο</span>
      </v-tooltip>
      <v-tooltip bottom>
      <v-btn fab flat outline small :color="toolColors[1]" slot="activator" @click="setDraw('LineString')">
        <v-icon dark>linear_scale</v-icon>
      </v-btn>
        <span>Βάλε στο χάρτη μία γραμμή</span>
      </v-tooltip>
      <v-tooltip bottom>
      <v-btn fab flat outline small :color="toolColors[2]" slot="activator" @click="setDraw('Polygon')">
        <v-icon dark>rounded_corner</v-icon>
      </v-btn>
        <span>Βάλε στο χάρτη ένα πολύγωνο</span>
      </v-tooltip>
      <v-tooltip bottom>
      <v-btn fab flat outline small :color="toolColors[3]" slot="activator" @click="videoUrlDialog = true">
        <v-icon dark>video_call</v-icon>
      </v-btn>
        <span>Πρόσθεσε ένα video</span>
      </v-tooltip>
      <v-tooltip bottom>
      <v-btn fab flat outline small :color="toolColors[4]" slot="activator" @click="imageUrlDialog = true">
        <v-icon dark>add_a_photo</v-icon>
      </v-btn>
        <span>Πρόσθεσε μια εικόνα</span>
      </v-tooltip>
    </v-layout>

    <v-dialog
      v-model="imageUrlDialog"
    >
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          Προσθήκη εικόνας
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="imageURL"
            label="Διεύθυνση (url) εικόνας"
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            flat
            @click="
              imageUrlDialog = false;
              $store.commit('addImageToPost', imageURL);
              $store.commit('setUserPostProperties', [{ property: 'images', value: imageURL }]);
            "
          >
            ΟΚ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="videoUrlDialog"
    >
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          Προσθήκη Youtube video
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="videoURL"
            label="Διεύθυνση (url) Youtube"
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            flat
            @click="addVideoToPost()"
          >
            ΟΚ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import getYouTubeID from 'get-youtube-id';
import userSelector from './selectCloseUsers';
import olMap from '../js/map';

export default {
  name: 'mapTools',
  props: ['idtomatch', 'replyid'],
  components: {
    userSelector,
  },
  data: () => ({
    selectColor: 'green',
    drawColor: 'white',
    toolColors: ['green', 'grey', 'grey', 'grey', 'grey'],
    selectedFeature: olMap.selectedFeature,
    activeAnalysis: null,
    userSelector: false,
    createBufferDialog: false,
    bufferDistance: 500,
    measurement: '',
    dialogMeasurements: false,
    imageUrlDialog: false,
    videoUrlDialog: false,
    imageURL: undefined,
    videoURL: undefined,
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
  methods: {
    setDraw(type) {
      if (this.idtomatch === 'reply') {
        this.$store.commit('addingToPost', { type: 'reply', id: this.replyid });
      }
      if (this.idtomatch === 'home') {
        this.$store.commit('addingToPost', { type: 'home', id: 'home' });
      }
      if (this.idtomatch === 'collection') {
        // console.log({ type: 'collection', id: this.$store.state.openedTimeline.id });
        this.$store.commit('addingToPost', { type: 'collection', id: this.$store.state.openedTimeline.id });
      }

      if (type === 'Point') {
        this.toolColors = ['green', 'grey', 'grey', 'grey', 'grey'];
        olMap.setActiveInteraction('Point');
      }
      if (type === 'LineString') {
        this.toolColors = ['grey', 'green', 'grey', 'grey', 'grey'];
        olMap.setActiveInteraction('LineString');
      }
      if (type === 'Polygon') {
        this.toolColors = ['grey', 'grey', 'green', 'grey', 'grey'];
        olMap.setActiveInteraction('Polygon');
      }
    },
    addToPost() {
      console.log(this.$store.state.feature);
      this.$store.commit('newPostFeature', this.$store.state.feature);
    },
    chatOnThisFeature() {
      this.userSelector = true;
    },
    addVideoToPost() {
      this.videoUrlDialog = false;
      const id = getYouTubeID(this.videoURL);
      this.$store.commit('addVideoToPost', id);
      this.$store.commit('setUserPostProperties', [{ property: 'videos', value: id }]);
    },
  },
};
</script>
<style>
.overflowing {
  z-index: 99;
}
</style>
