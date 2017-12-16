<template>
  <v-layout>
    <v-flex xs12 sm12>
      <v-card>
      <v-layout row wrap>
            <v-flex md9>
            <v-text-field
              autofocus
              name="input-1"
              label="Νέα ανάρτηση"
              hint="Γράψε εδώ το κείμενό σου"
              v-model="postText"
              id="postText"
                  counter
                  max="120"
                  full-width
                  multi-line
            ></v-text-field>
            </v-flex>
          <v-flex md1>
            <div class='text-md-right'>
              <v-btn outline medium fab class="indigo--text" @click= "showMapTools" data-tooltip="Σχεδίασε στο χάρτη και πρόσθεσε το σχέδιο στην ανάρτηση!" data-tooltip-location="left">
                <v-icon>edit</v-icon>
              </v-btn>
            </div>
            </v-flex>
        </v-layout>
            <v-flex v-if="drawnFeatures !== undefined">
              <v-chip close v-for="f in drawnFeatures" :key='f.drawId' @input="remove(f.drawId)">
                {{ f.getGeometry().getType() }}
              </v-chip>
            </v-flex>
        <v-card-actions>
          <v-btn flat class="green white--text darken-1" @click="publishPost">Δημοσιευση<v-icon right dark>insert_comment</v-icon></v-btn>
          <v-btn small fab class="green white--text">
            <v-icon white--text dark>help_outline</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import ol from 'openlayers';
import axios from 'axios';
import olMap from '../js/map';
import config from '../config';

export default {
  props: ['id'],
  name: 'newpost',
  data: () => ({
    postText: '',
  }),
  methods: {
    publishPost() {
      console.log('PUBLISH');
      const featuresToPost = this.drawnFeatures;
      console.log('featuresToPost :: ', featuresToPost);
      const textToPost = this.postText;
      let userFeats;
      if (featuresToPost) {
        const geojsonFormat = new ol.format.GeoJSON();
        userFeats = geojsonFormat.writeFeatures(featuresToPost);
        console.log(userFeats, textToPost);
      } else {
        userFeats = null;
      }
      const userPost = {
        // eslint-disable-next-line
        userId: this.$store.state.user._id,
        username: this.$store.state.user.name,
        text: textToPost,
        timestamp: Date.now(),
        userFeatures: userFeats,
        isReplyTo: this.id,
        group: null,
      };
      console.log(userPost);
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts`;
      axios.post(url, { userPost }).then((response) => {
        console.log('trying to reset component');
        this.postText = '';
        featuresToPost.forEach((f) => {
          this.remove(f);
        });
        console.log(response.data);
      }).then((response) => {
        // delete these features from store
        console.log(response.data);
      });
    },
    showMapTools() {
      this.$root.$emit('showTools');
      if (this.id !== undefined) {
        this.$store.commit('addingToPost', this.id);
      } else {
        this.$store.commit('addingToPost', 'newPost');
      }
    },
    setCenter() {
      olMap.getView().setCenter(0, 0);
    },
    remove(item) {
      this.$store.commit('deleteFeatureFromPost', item);
    },
  },
  computed: {
    drawnFeatures: function d() {
      let selectedFeatures;
      let objIndex;
      const allFeatures = this.$store.getters.getDrawnFeatures;
      if (this.id === undefined) {
        objIndex = allFeatures.findIndex((obj => obj.id === 'newPost'));
      } else {
        objIndex = allFeatures.findIndex((obj => obj.id === this.id));
      }
      if (objIndex > -1) {
        selectedFeatures = allFeatures[objIndex].features;
      }
      console.log('allfeatures', allFeatures, 'objindex', objIndex, this.id, selectedFeatures);
      return selectedFeatures;
    },
    activeChips: function ch() {
      const chips = [];
      const allFeatures = this.$store.getters.getDrawnFeatures;
      // console.log(allFeatures);
      allFeatures.forEach((c) => {
        const feats = c.features;
        feats.forEach((f) => {
          chips.push(f.drawId);
        });
      });
      return chips;
    },
  },
};
</script>
