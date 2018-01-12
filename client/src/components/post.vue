<template>
  <v-layout>
    <v-flex xs12 sm12>
      <v-card @newreply="new_post_sent(arguments[0])">
        <v-card-title primary-title>
          <div class="text-xs-left">
            <b>@{{post.userName}}:</b>
            <span md12 v-if="post.text" v-html="post.text" v-linkified></span>
            <p>{{timestamp}}</p>
          </div>
        </v-card-title>
        <v-card-actions class="white">
          <!-- <v-spacer></v-spacer> -->
            <v-tooltip bottom>
              <v-btn slot="activator" v-if='post.userFeatures != "{\"type\":\"FeatureCollection\",\"features\":[]}" && post.userFeatures !== null' class="green white--text darken-1" @click="explore(post)">Δες το στο χάρτη<v-icon right dark>language</v-icon></v-btn>
              <span>Βάλτο στο χάρτη</span>
            </v-tooltip>
            <v-btn v-bind:class="[answerPostColor, answerPostTextColor]" @click="toggle_answer" v-if="$store.state.isUserLoggedIn === true">
            {{answerPostText}}<v-icon right dark>insert_comment</v-icon></v-btn>
            <v-tooltip bottom>
              <v-btn color="green" slot="activator" outline small fab v-if="post.repliesData == undefined && post.replies.length > 0" @click="showMoreReplies">
                <v-icon large color="grey">insert_comment</v-icon>
                {{ post.replies.length }}
              </v-btn>
              <span>Δες απαντήσεις</span>
            </v-tooltip>

        </v-card-actions>
        <newPost v-if="answerPost==true" :id="post._id"></newPost>

        <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i>
        <v-flex class="ma-0 pa-0"
          md12
          v-for="post in replies.slice(0, loadmorereplies)"
          :key="post._id"
        >
          <post :post='post'></post>
        </v-flex>
        <v-btn block color="white" v-if="replies.length > 0 && loadmorereplies < post.repliesData.length" @click="loadmorereplies = post.repliesData.length">Φορτωση περισσοτερων απαντησεων</v-btn>

        <v-flex class="ma-0 pa-0"
          md12 
          v-if="fetchedReplies.length > 0"
          v-for="reply in fetchedReplies"
          :key="reply._id"
        >
          <post :post='reply' transition="scale-transition"></post>
        </v-flex>
      </v-card>
    </v-flex>
      <v-snackbar
        :timeout=5000
        v-model="snackbarNewPost"
        :color= "snackbarColor"
      >{{ newPostInfo }}</v-snackbar>
  </v-layout>
</template>
<script>
// import { mapActions, mapGetters } from 'vuex';
import ol from 'openlayers';
import moment from 'moment';
import axios from 'axios';
import config from '../config';
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
    newPostInfo: '',
    snackbarNewPost: false,
    snackbarColor: '',
    loadmorereplies: 2,
    replies: [],
    showReplies: false,
    startPage: 0,
    limitPage: 10,
    loading: false,
    fetchedReplies: [],
  }),
  components: {
    newPost,
  },
  mounted() {
    this.explore(this.post);
    this.repliesReversed();
  },
  methods: {
    showMoreReplies() {
      const serverUrl = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts/replies`;
      axios.get(serverUrl, { params: {
        ids: this.post.replies,
        start: this.startPage.toString(),
        end: this.limitPage.toString(),
      },
      }).then((response) => {
        this.fetchedReplies = response.data;
      }).then(() => {
        this.loading = false;
      });

      this.showReplies = true;
    },
    repliesReversed() {
      let reversed;
      if (this.post.repliesData && this.post.repliesData.length > 0) {
        reversed = this.post.repliesData.reverse();
      } else {
        reversed = [];
      }
      this.replies = reversed;
    },
    explore(post) {
      const geojsonFormat = new ol.format.GeoJSON();
      const newFeature = post.userFeatures;
      if (newFeature !== '{"type":"FeatureCollection","features":[]}' && newFeature !== null) {
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
    new_post_sent(reply) {
      console.log('event caught::');
      // if (result === 'success') {
      this.newPostInfo = 'Δημοσιεύτηκε η απάντηση!';
      this.snackbarColor = 'green';
      this.snackbarNewPost = true;
      this.$parent.$emit('newreply', reply);
      this.toggle_answer();
      // }
    },
  },
  computed: {
    timestamp() {
      return moment(parseInt(this.post.timestamp, 0)).format('lll');
    },
  },
};
</script>
