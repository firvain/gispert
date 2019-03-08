<template>
  <v-layout>
    <v-flex xs12 sm12>
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
            box
            outline
            rows=2
          ></v-textarea>
            <!-- :hint="$t('message.youMayWriteAndSketch')" -->
        </v-flex>
        <mapTools
          v-if="$store.state.addingToPost"
          :idtomatch = "idToMatch"
          :replyid='id'>
        </mapTools>
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
  props: ['id', 'collectionId', 'collectionTitle'],
  name: 'newpost',
  data: () => ({
    postText: '',
    collectionMembersToEmit: {},
    newPostInfo: '',
    snackbarNewPost: false,
    snackbarColor: '',
    showingMapTool: false,
  }),
  components: {
    mapTools,
  },
  mounted() {
    console.log('new reply mounted');
  },
  methods: {
    cancelPost() {
      this.postText = '';
      this.selectCollection = '';
      this.$emit('closeReply');
      let newPostStorage;
      let newPostFeatures;
      if (this.$store.state.storage.filter(obj => obj.id === this.id)) {
        newPostStorage = this.$store.state.storage.filter(obj =>
          obj.id === this.id);
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
      this.$store.commit('clearNewPostFeatures', this.id);
      this.$store.commit('setSelected', null);
      this.$store.commit('setActiveMapTool', 'selectFeatures');
    },
    publishPost() {
      console.log('PUBLISH');
      const textToPost = this.postText;
      const featuresToPost = this.drawnFeatures;
      let userFeats;
      if (featuresToPost) {
        const geojsonFormat = new ol.format.GeoJSON();
        userFeats = geojsonFormat.writeFeatures(featuresToPost);
        // console.log(userFeats, textToPost);
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
        isReplyTo: this.id,
        collection: this.collectionId,
        replies: [],
        type: 'reply',
        images: this.userImages,
        videos: this.userVideos,
      };
      // console.log('this is the post to publish', userPost);
      const url = `${config.url}/posts`;
      // const members = this.findMembersOfThisCollection();
      // console.log('members :: ', JSON.stringify(members));
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

          this.$store.commit('clearNewPostFeatures', this.id);
          console.log('response from API -is reply to- is:: ', response.data.isReplyTo);
          // eslint-disable-next-line
          userPost._id = response.data.id;
          console.log('this is the userpost new reply 0:: ', JSON.stringify(userPost));
          // console.log('emitting to::', this.collectionMembers);
          console.log('reply userPost for socket 1:: ', JSON.stringify(userPost));
          userPost.collectionData = [{
            title: this.collectionTitle,
            _id: this.collectionId, // eslint-disable-line no-underscore-dangle
          }];
          console.log('reply userPost for socket 2:: ', JSON.stringify(userPost));
          userPost.isReplyTo = response.data.isReplyTo;
          console.log('reply userPost for socket 3:: ', JSON.stringify(userPost));
          if (userFeats !== null) {
            userPost.featureData = JSON.parse(userFeats).features;
          } else {
            userPost.featureData = [];
          }
          console.log('reply userPost for socket 4:: ', JSON.stringify(userPost));
          this.$store.dispatch('addReplyToThread', userPost);
          this.$eventHub.$emit('newReply', userPost);
          this.$socket.emit('newReply', userPost);
        });
      } else {
        this.newPostInfo = this.$t('message.errorNoTextOrSketches');
        this.snackbarColor = 'red';
        this.snackbarNewPost = true;
      }
    },
    showMapTools() {
      this.showingMapTool = true;
      // this.$store.commit('setActiveMapTool', 'drawFeatures');
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
      if (this.id) {
        setid = 'reply';
      }
      if (this.id === undefined && this.$store.state.activeTab === 'home') {
        setid = 'home';
      }
      if (this.id === undefined && this.$store.state.activeTab === 'explore') {
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
          images = allFeatures[objIndex].images;
        }
      }
      return images[0];
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
          videos = allFeatures[objIndex].videos;
        }
      }
      return videos[0];
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
    computedCollections: function c() {
      let vuexCollections = [];

      this.$store.state.privateCollections.forEach((col) => {
        vuexCollections.push(col);
      });

      this.$store.state.publicCollections.forEach((col) => {
        vuexCollections.push(col);
      });

      // console.log('collections computed:: ', vuexCollections);
      this.selectCollections = vuexCollections[0];
      vuexCollections.forEach((collection) => {
        // const label = `${collection.title} ${collection.username}`;
        const label = `${collection.title}`;
        // eslint-disable-next-line
        collection.title = label;
      });

      const memberof = vuexCollections.filter((m) => {
          // eslint-disable-next-line
          if (m.members) { m.members.includes(this.$store.state.user._id) }
        return m;
      });
      memberof.forEach((collection) => {
        const label = `${collection.title}`;
        // eslint-disable-next-line
        collection.title = label;
      });

      // console.log(memberof[0].title, memberof[0].username);
      // console.log(memberof[1].title, memberof[1].username);
      // console.log(memberof[2].title, memberof[2].username);
      // eslint-disable-next-line
      vuexCollections = vuexCollections.filter(c => c.user === this.$store.state.user._id);
      // console.log('postable:: ', this.postableCollections);
      memberof.forEach((e) => {
        vuexCollections.push(e);
      });
      return vuexCollections;
    },
    // collectionMembersToEmit: () => {
      // const members = [];
      // console.log('members:: ', this.collectionMembersInitial.members);
      // if (this.collectionMembersInitial.members.length > 0) {
      //   members = this.collectionMembersInitial.members;
      // } else {
      //   members = ['test'];
      // }
      // if (this.id === undefined) {
      //   members = 'this.collectionMembers';
      // }
      // console.log(members);
      // return ['test', members];
    // },
  },
  watch: {
    selectCollections: function handle() {
      this.findMembersOfThisCollection();
    },
  },
};
</script>
<style scoped>
  .active {
    background-color: greenyellow;
  }
</style>
