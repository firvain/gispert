<template>
  <v-layout>
    <v-flex xs12 sm12>
      <v-card>
        <v-card-title primary-title>
          <div class="text-xs-left">
            <b>@{{post.userName}}:</b>
            <span md12 v-if="post.text" v-html="post.text" v-linkified></span>
            <p>{{timestamp}}</p>
          </div>
        </v-card-title>
        <v-card-actions class="white">
          <v-spacer></v-spacer>
          <v-card-actions>
            <v-btn v-if='post.userFeatures != "{\"type\":\"FeatureCollection\",\"features\":[]}"' class="green white--text darken-1" @click="explore(post)">Δες το στο χάρτη<v-icon right dark>language</v-icon></v-btn>
          </v-card-actions>
          <v-card-actions>
            <v-btn v-bind:class="[answerPostColor, answerPostTextColor]" @click="toggle_answer" v-if="$store.state.isUserLoggedIn">
            {{answerPostText}}<v-icon right dark>insert_comment</v-icon></v-btn>
          </v-card-actions>
        </v-card-actions>
        <newPost v-if="answerPost==true && $store.state.isUserLoggedIn" :id="post._id"></newPost>
        <v-flex
          md12
          v-for="post in post.repliesData"
          :key="post._id"
        >
          <post :post='post' @explore="explore(post)"></post>
        </v-flex>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
// import { mapActions, mapGetters } from 'vuex';
import ol from 'openlayers';
import moment from 'moment';
import newPost from './new_post';
import olMap from '../js/map';
import styles from '../js/styles';

export default {
  props: ['post'],
  name: 'post',
  data: () => ({
    answerPost: false,
    answerPostText: 'απαντησε',
    answerPostColor: 'green',
    answerPostTextColor: 'white--text darken-1',
  }),
  components: {
    newPost,
  },
  mounted() {
    this.explore(this.post);
  },
  methods: {
    // ...mapActions(['addToCompare']),
    explore(post) {
      const geojsonFormat = new ol.format.GeoJSON();
      const newFeature = post.userFeatures;
      // console.log(post);
      // this.$emit('explore', this.post);
      if (newFeature !== '{"type":"FeatureCollection","features":[]}') {
        let allLayers = [];
        allLayers = olMap.getLayers().getArray();
        allLayers.forEach((layer) => {
          if (layer.getProperties().name === 'customLayer') {
            const AddedFeature = geojsonFormat.readFeatures(newFeature);
            let alreadyExists = false;
            layer.getSource().forEachFeature((feature) => {
              // console.log(AddedFeature);
              if (feature.get('mongoID') === AddedFeature[0].getProperties().mongoID) {
                alreadyExists = true;
              }
            });
            const g = AddedFeature[0].getGeometry().getExtent();
            if (alreadyExists === false) {
              layer.getSource().addFeatures(AddedFeature);
            }
            if (g[0] - g[2] < 500) {
              g[0] -= 400;
              g[2] += 400;
            }
            if (g[1] - g[3] < 500) {
              g[1] -= 400;
              g[3] += 400;
            }
            olMap.getView().fit(g, olMap.getSize());
            const cs = AddedFeature[0].getStyle();

            AddedFeature[0].setStyle(styles.BoldLineString);

            setTimeout(() => {
              AddedFeature[0].setStyle(cs);
              olMap.updateSize();
            }, 500);
          }
        });
      }
    },
    toggle_answer() {
      this.answerPost = !this.answerPost;
      if (this.answerPostText === 'ακυρο') {
        this.answerPostText = 'απαντησε';
        this.answerPostColor = 'green';
      } else {
        this.answerPostText = 'ακυρο';
        this.answerPostColor = 'red';
      }
    },
  },
  computed: {
    timestamp() {
      return moment(parseInt(this.post.timestamp, 0)).format('lll');
    },
  },
};
</script>
