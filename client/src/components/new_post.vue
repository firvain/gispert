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
        <v-flex xs12 sm6 class="py-2">
            <v-btn-toggle mandatory v-model="toggle_one">
              <v-btn flat>
                Δημοσιο
              </v-btn>
              <v-btn flat>
                Ιδιωτικο
              </v-btn>
            </v-btn-toggle>
          </v-flex>
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
    toggle_one: 0,
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
      let idToReply;
      if (this.id !== undefined) {
        idToReply = this.id;
      } else {
        idToReply = '';
      }
      const userPost = {
        // eslint-disable-next-line
        userId: this.$store.state.user._id,
        username: this.$store.state.user.name,
        text: textToPost,
        timestamp: Date.now(),
        userFeatures: userFeats,
        isReplyTo: idToReply,
        group: 'none',
        replies: [],
      };
      console.log(userPost);
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts`;
      axios.post(url, { userPost }).then((response) => {
        console.log('trying to reset component');
        this.postText = '';
        // featuresToPost.forEach((f) => {
        //   this.remove(f);
        // });
        console.log('1 :: ', response.data);
        this.$store.commit('clearNewPostFeatures', 'newPost');
        if (this.id !== undefined) {
          this.$parent.$emit('newpost');
        } else {
          this.$parent.$emit(this.id);
        }
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
      let selectedFeatures = null;
      let objIndex = null;
      const allFeatures = this.$store.getters.getDrawnFeatures;
      if (this.id === undefined && allFeatures !== undefined) {
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
      if (allFeatures !== undefined) {
        allFeatures.forEach((c) => {
          const feats = c.features;
          feats.forEach((f) => {
            chips.push(f.drawId);
          });
        });
      }
      return chips;
    },
  },
};
</script>
