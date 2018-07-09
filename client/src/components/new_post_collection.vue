<template>
  <v-layout>
    <v-flex xs12 sm12>
      <v-card>
        <v-flex>
          <v-text-field
            @focus="showMapTools()"
            autofocus
            name="input-1"
            :label="$t('message.youMayWriteAndSketch')"
            v-model="postText"
            id="postText"
            counter
            max="200"
            textarea box
            rows=2
          ></v-text-field>
            <!-- :hint="$t('message.youMayWriteAndSketch')" -->
        </v-flex>
        <mapTools v-if="$store.state.addingToPost && $store.state.addingToPost.type === idToMatch"></mapTools>
        <v-flex v-if="drawnFeatures !== undefined">
          <v-chip close v-for="f in drawnFeatures" :key="f.get('mongoID')" @input="remove(f.get('mongoID'))">
            {{ f.getGeometry().getType() }}
          </v-chip>
        </v-flex>

        <v-card-actions>
          <v-flex xs3 sm6 md6>
            <v-btn flat class="green white--text darken-1" @click="publishPost">{{ $t('message.publish') }}
              <v-icon right dark>send</v-icon>
            </v-btn>
          </v-flex>
        </v-card-actions>
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
  }),
  components: {
    mapTools,
  },
  mounted() {
    console.log('new post for reply mounted');
  },
  methods: {
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
      };
      // console.log('this is the post to publish', userPost);
      const url = `${config.url}/posts`;
      if (textToPost !== '') {
        axios.post(url, { userPost }, {
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          // console.log('trying to reset component');
          console.log('response from API is:: ', response.data);
          // TODO must handle response
          this.postText = '';
          this.newPostInfo = this.$t('message.published');
          this.snackbarColor = 'green';
          this.snackbarNewPost = true;

          this.$store.commit('clearNewPostFeatures', 'newPost');
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
          userPost.collectionData = {
            title: this.$store.state.openedTimeline.title,
            _id: this.$store.state.openedTimeline.id, // eslint-disable-line no-underscore-dangle
          };

          console.log('user post is:: ', JSON.stringify(userPost));
          const newThread = {
            _id: userPost._id, // eslint-disable-line no-underscore-dangle
            count: 1,
            posts: [userPost],
          };
          console.log('new thread:: ', newThread);
          this.$store.dispatch('addPostToTimeline', newThread);
          this.$socket.emit('newPost', newThread);
          this.$eventHub.$emit('newPost', newThread);

          console.log(JSON.parse(userFeats));
          console.log('new post userPost for socket:: ', JSON.stringify(userPost), 'res::', response.data.id);
          // this.$socket.emit('newPost', userPost);
          console.log('check if feature data present::', JSON.stringify(userPost));
          if (this.$store.state.openedTimeline &&
            this.$store.state.openedTimeline.type === 'collection'
            && this.$store.state.openedTimeline.id ===
            this.selectCollection._id) { // eslint-disable-line no-underscore-dangle
            this.$store.dispatch('addPostToCollectionView', newThread);
          }
          if (this.$store.state.openedTimeline &&
            this.$store.state.openedTimeline.type === 'timeline'
            && this.$store.state.openedTimeline.id ===
            userPost.userId) { // eslint-disable-line no-underscore-dangle
            console.log('adding the post to userTimeline');
            this.$store.dispatch('addPostToUserTimeline', newThread);
          }
        });
      } else {
        this.newPostInfo = this.$t('message.errorNoTextOrSketches');
        this.snackbarColor = 'red';
        this.snackbarNewPost = true;
      }
    },
    showMapTools() {
      this.showingMapTool = true;
      this.$store.commit('setActiveMapTool', 'drawFeatures');
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
    setCenter() {
      olMap.getView().setCenter(0, 0);
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
        selectedFeatures = allFeatures[objIndex].features;
      }
      // console.log('allfeatures', allFeatures, 'objindex', objIndex, this.id, selectedFeatures);
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
<style scoped>
  .active {
    background-color: greenyellow;
  }
</style>
