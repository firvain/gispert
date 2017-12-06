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
import { mapActions, mapGetters } from 'vuex';
// import ol from 'openlayers';
import olMap from '../js/map';

export default {
  props: ['id'],
  name: 'newpost',
  data: () => ({
    postText: '',
  }),
  methods: {
    ...mapActions(['addToCompare']),
    // publishPost() {
    //   const featuresToPost = this.drawnFeatures;
    //   const text = this.postText;
    //   const geojsonFormat = new ol.format.GeoJSON();
    //   const userFeats = geojsonFormat.writeFeatures(featuresToPost);
    //   console.log(userFeats, text);
    //   const userPost = {
    //     userId: 'yiannisID',
    //     username: 'ytsampouris',
    //     timestamp: Date.now(),
    //     userFeatures: userFeats,
    //     isReplyTo: this.id,
    //     group: null,
    //   };
      // TODO use axios to post this to API
    //   console.log(userPost);
    // },
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
    ...mapGetters({
      results: 'cartEstates',
    }),
    drawnFeatures: function d() {
      let selectedFeatures;
      const allFeatures = this.$store.getters.getDrawnFeatures;
      const objIndex = allFeatures.findIndex((obj => obj.id === this.id));
      if (objIndex > -1) {
        selectedFeatures = allFeatures[objIndex].features;
      }
      // console.log(this.activeChips);
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
