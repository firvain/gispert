<template>
  <v-layout>
    <v-btn block slot="activator" color="primary" dark large
      @click="showNewPost = true; showMapTools();"
      v-if="$store.state.isUserLoggedIn === true && !showNewPost"
    >
      {{ $t('message.newPost')}}
      <v-icon right dark>insert_comment</v-icon>
    </v-btn>
    <v-flex xs12 sm12 v-show="showNewPost">
      <v-card>
        <v-flex>
          <v-textarea
            @focus="showMapTools()"
            autofocus
            name="input-1"
            :label="$t('message.youMayWriteAndSketch')"
            v-model="postText"
            id="postText"
            counter
            max="200"
            outline box
            rows=2
          ></v-textarea>
            <!-- :hint="$t('message.youMayWriteAndSketch')" -->
        </v-flex>
        <mapTools idtomatch='collection'></mapTools>
        <v-flex v-if="drawnFeatures !== undefined">
          <v-chip close v-for="f in drawnFeatures" :key="f.get('mongoID')"
            @click='zoomToChip(f)' @input="remove(f.get('mongoID'))">
            {{ geometryTypeText(f.getGeometry().getType()) }}
          </v-chip>
        </v-flex>
        <v-layout>
          <v-flex md6>
            <v-btn block color="green white--text darken-1" @click="publishPost">{{ $t('message.publish') }}
              <v-icon right dark>send</v-icon>
            </v-btn>
          </v-flex>
          <v-flex md6>
            <v-btn block color="error" @click="cancelPost">{{ $t('message.cancel') }}
              <v-icon right dark>cancel</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card>
      <v-snackbar
        :timeout=5000
        v-model="snackbarNewPost"
        :color= "snackbarColor"
      >{{ newPostInfo }}</v-snackbar>
    </v-flex>
  </v-layout>
</template>
<script>
import ol from 'openlayers';
import axios from 'axios';
import mapTools from '@/components/maptoolsdraw';
import olMap from '../js/map';
import config from '../config';

export default {
  name: 'newpost',
  data: () => ({
    postText: '',
    toggle_one: 0,
    selectCollection: '',
    collections: [],
    newPostInfo: '',
    snackbarNewPost: false,
    snackbarColor: '',
    showingMapTool: false,
    showNewPost: false,
  }),
  components: {
    mapTools,
  },
  mounted() {
    console.log('new post for reply mounted');
  },
  methods: {
    cancelPost() {
      this.postText = '';
      this.selectCollection = '';
      this.showNewPost = false;
      let newPostStorage;
      let newPostFeatures;
      if (this.$store.state.storage.filter(obj => obj.id === this.$store.state.openedTimeline.id)) {
        newPostStorage = this.$store.state.storage.filter(obj =>
          obj.id === this.$store.state.openedTimeline.id);
      }
      if (newPostStorage[0]) {
        newPostFeatures = newPostStorage[0].features;
        const newPostFeaturesIds = [];
        newPostFeatures.forEach((f) => {
          newPostFeaturesIds.push(f.get('mongoID'));
        });
        let allLayers = [];
        allLayers = olMap.getLayers().getArray();
        allLayers.forEach((layer) => {
          if (layer.getProperties().name === 'customLayer') {
            layer.getSource().forEachFeature((feature) => {
              if (newPostFeaturesIds.includes(feature.get('mongoID'))) {
                layer.getSource().removeFeature(feature);
              }
            });
          }
        });
        olMap.getInteractions().forEach((interaction) => {
          if (interaction instanceof ol.interaction.Select) {
            interaction.getFeatures().clear();
          }
        });
      }
      this.$store.commit('clearNewPostFeatures', this.$store.state.openedTimeline.id);
      this.$store.commit('setSelected', null);
      olMap.setActiveInteraction('select');
    },
    publishPost() {
      console.log('PUBLISH');
      const textToPost = this.postText;
      const featuresToPost = this.drawnFeatures;
      let userFeats;
      if (featuresToPost) {
        const geojsonFormat = new ol.format.GeoJSON();
        userFeats = geojsonFormat.writeFeatures(featuresToPost);
      } else {
        userFeats = null;
      }
      const userPost = {
        // eslint-disable-next-line
        userId: this.$store.state.user._id,
        userName: this.$store.state.user.name,
        text: textToPost,
        timestamp: Date.now(),
        userFeatures: userFeats,
        collection: this.$store.state.openedTimeline.id, // eslint-disable-line no-underscore-dangle
        replies: [],
        type: 'new',
        images: this.userImages,
        videos: this.userVideos,
      };
      // console.log('this is the post to publish', userPost);
      const url = `${config.url}/posts`;
      if (textToPost !== '') {
        axios.post(url, { userPost }, {
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          this.showNewPost = false;
          // console.log('trying to reset component');
          console.log('response from API is:: ', response.data);
          // TODO must handle response
          this.postText = '';
          this.newPostInfo = this.$t('message.published');
          this.snackbarColor = 'green';
          this.snackbarNewPost = true;

          this.$store.commit('clearNewPostFeatures', this.$store.state.openedTimeline.id);
          console.log('response from API -is reply to- is:: ', response.data.isReplyTo);
          console.log('totally new post');
          // console.log('this is the userpost newpost:: ', userPost);
          // console.log('emitting to::', members);
          console.log('user post is:: ', JSON.stringify(userPost));
          userPost._id = response.data.id; // eslint-disable-line no-underscore-dangle
          userPost.isReplyTo = response.data.id;
          if (userFeats !== null) {
            userPost.featureData = JSON.parse(userFeats).features;
          } else {
            userPost.featureData = [];
          }
          userPost.collectionData = [{
            title: this.$store.state.openedTimeline.title,
            _id: this.$store.state.openedTimeline.id, // eslint-disable-line no-underscore-dangle
          }];

          console.log('user post is:: ', JSON.stringify(userPost));
          const newThread = {
            _id: userPost._id, // eslint-disable-line no-underscore-dangle
            count: 1,
            posts: [userPost],
          };
          console.log('new thread:: ', newThread);
          this.$socket.emit('newPost', newThread);
          this.$eventHub.$emit('newPost', newThread);
          this.$store.dispatch('addPostToTimeline', newThread);
          this.$store.dispatch('addPostToCollectionView', newThread);
        });
      } else {
        this.newPostInfo = this.$t('message.errorNoTextOrSketches');
        this.snackbarColor = 'red';
        this.snackbarNewPost = true;
      }
    },
    showMapTools() {
      this.showingMapTool = true;
      // console.log('post id:: ', this.id);
      if (this.idToMatch === 'reply') {
        this.$store.commit('addingToPost', { type: 'reply', id: this.id });
      }
      if (this.idToMatch === 'home') {
        this.$store.commit('addingToPost', { type: 'home', id: 'home' });
      }
      if (this.idToMatch === 'collection') {
        // console.log({ type: 'collection', id: this.$store.state.openedTimeline.id });
        this.$store.commit('addingToPost', { type: 'collection', id: this.$store.state.openedTimeline.id });
      }
    },
    zoomToChip(f) {
      const g = f.getGeometry().getExtent();
      if (g[0] - g[2] < 500) {
        g[0] -= 200;
        g[2] += 200;
      }
      if (g[1] - g[3] < 500) {
        g[1] -= 200;
        g[3] += 200;
      }
      olMap.getView().fit(g, olMap.getSize());
    },
    remove(id) {
      this.$store.commit('deleteFeatureFromPost', id);
      console.log('deleting :: ', id);
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach((layer) => {
        if (layer.getProperties().name === 'customLayer') {
          layer.getSource().forEachFeature((feature) => {
            if (feature.get('mongoID') === id) {
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
    },
    geometryTypeText(geom) {
      let text;
      if (geom === 'Point') { text = 'Σημείο'; }
      if (geom === 'LineString') { text = 'Γραμμή'; }
      if (geom === 'Polygon') { text = 'Πολύγωνο'; }
      return text;
    },
  },
  computed: {
    idToMatch: function findid() {
      let setid;
      if (this.$store.state.activeTab === 'home') {
        setid = 'home';
      }
      if (this.$store.state.activeTab === 'explore') {
        setid = 'collection';
      }
      return setid;
    },
    drawnFeatures: function d() {
      let selectedFeatures = null;
      let objIndex = null;
      const allFeatures = this.$store.getters.getDrawnFeatures;
      if (allFeatures.length > 0) {
        if (this.id === undefined && allFeatures !== undefined && this.$store.state.activeTab === 'home') {
          objIndex = allFeatures.findIndex((obj => obj.id === 'home'));
        }
        if (this.id === undefined && allFeatures !== undefined && this.$store.state.activeTab === 'explore') {
          objIndex = allFeatures.findIndex((obj => obj.type === 'collection'));
        }
        if (this.id !== undefined && allFeatures !== undefined) {
          objIndex = allFeatures.findIndex((obj => obj.id === this.id));
        }
        if (objIndex > -1 && allFeatures !== undefined) {
          selectedFeatures = allFeatures[objIndex].features;
        }
      }
      // console.log('allfeatures', allFeatures, 'objindex', objIndex, this.id, selectedFeatures);
      return selectedFeatures;
    },
    userImages: function i() {
      let images = null;
      let objIndex = null;
      const allFeatures = this.$store.getters.getDrawnFeatures;
      if (allFeatures.length > 0) {
        if (this.id === undefined && allFeatures !== undefined && this.$store.state.activeTab === 'home') {
          objIndex = allFeatures.findIndex((obj => obj.id === 'home'));
        }
        if (this.id === undefined && allFeatures !== undefined && this.$store.state.activeTab === 'explore') {
          objIndex = allFeatures.findIndex((obj => obj.type === 'collection'));
        }
        if (this.id !== undefined && allFeatures !== undefined) {
          objIndex = allFeatures.findIndex((obj => obj.id === this.id));
        }
        if (objIndex > -1 && allFeatures !== undefined) {
          images = allFeatures[objIndex].images[0];
        }
      }
      return images;
    },
    userVideos: function i() {
      let videos = null;
      let objIndex = null;
      const allFeatures = this.$store.getters.getDrawnFeatures;
      if (allFeatures.length > 0) {
        if (this.id === undefined && allFeatures !== undefined && this.$store.state.activeTab === 'home') {
          objIndex = allFeatures.findIndex((obj => obj.id === 'home'));
        }
        if (this.id === undefined && allFeatures !== undefined && this.$store.state.activeTab === 'explore') {
          objIndex = allFeatures.findIndex((obj => obj.type === 'collection'));
        }
        if (this.id !== undefined && allFeatures !== undefined) {
          objIndex = allFeatures.findIndex((obj => obj.id === this.id));
        }
        if (objIndex > -1) {
          videos = allFeatures[objIndex].videos[0];
        }
      }
      return videos;
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
<style scoped>
  .active {
    background-color: greenyellow;
  }
</style>
