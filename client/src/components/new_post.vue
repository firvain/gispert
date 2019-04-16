<template>
  <v-layout>
    <v-btn block slot="activator" color="primary" dark large
      @click="
        showNewPost = true;
        showMapTools();
        $store.commit('resetUserPost');
        $store.commit('setUserPostProperties', [{ property: 'userName', value: `${$store.state.user.name}` }]);
        $store.commit('setUserPostProperties', [{ property: 'userId', value: `${$store.state.user._id}` }]);
        $store.commit('setUserPostProperties', [{ property: 'type', value: 'new' }]);
        $store.commit('setUserPostProperties', [{ property: 'collection', value: selectCollection._id }]);
      "
      v-if="$store.state.isUserLoggedIn === true && !showNewPost && $store.state.userPost.type !== 'new'"
    >
      {{ $t('message.newPost')}}
      <v-icon right dark>insert_comment</v-icon>
    </v-btn>
    <v-flex xs12 sm12 v-show="showNewPost">
      <v-card>
        <v-flex>
          <v-textarea
            @focus="showMapTools()"
            @input="$store.commit('setUserPostProperties', [{ property: 'text', value: postText }]);"
            autofocus
            name="input-1"
            :label="$t('message.youMayWriteAndSketch')"
            v-model="postText"
            id="postText"
            counter
            max="200"
            box
            rows=2
            outline
          ></v-textarea>
            <!-- :hint="$t('message.youMayWriteAndSketch')" -->
        </v-flex>
        <mapTools idtomatch='home'></mapTools>
        <v-flex>
          <v-chip close
            v-for="f in drawnFeatures"
            :key="f.features[0].properties.mongoID"
            @input="remove(f.features[0].properties.mongoID)"
            @click='zoomToChip(f.features[0])'>
            {{ geometryTypeText(f.features[0].geometry.type) }}
          </v-chip>
        </v-flex>

        <v-card-actions>
          <v-flex>
            <v-select
              v-bind:items="computedCollections"
              v-model="selectCollection"
              @change="$store.commit('setUserPostProperties', [{ property: 'collection', value: selectCollection._id }]);"
              :label="$t('message.collections')"
              single-line
              item-text="title"
              item-value="_id"
              return-object
              :hint="$t('message.chooseCollection')"
              persistent-hint
            ></v-select>
          </v-flex>
        </v-card-actions>
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
              <!-- <v-btn small fab class="green white--text">
                <v-icon white--text dark>help_outline</v-icon>
              </v-btn> -->
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
      const getIds = new Promise((resolve) => {
        const ids = this.$store.getters.getUserPostMongoIDs;
        resolve(ids);
      });
      console.log('getter :: ', this.$store.getters.getUserPostMongoIDs);

      getIds.then((ids) => {
        olMap.removeFeaturesFromLayer('customLayer', 'mongoID', ids);
      }).then(() => {
        this.$store.commit('resetUserPost');
        this.postText = '';
        this.selectCollection = '';
        this.showNewPost = false;
        this.$store.commit('setSelected', null);
        olMap.setActiveInteraction('select');
      });
    },
    publishPost() {
      console.log('PUBLISH');
      const vuexPost = this.$store.getters.getUserPost;
      const userPost = {
        // eslint-disable-next-line
        userId: vuexPost.userId,
        userName: vuexPost.userName,
        text: vuexPost.text,
        timestamp: Date.now(),
        userFeatures: vuexPost.userFeatures,
        collection: vuexPost.collection,
        replies: [],
        isReplyTo: '',
        type: vuexPost.type,
        images: vuexPost.images,
        videos: vuexPost.videos,
      };
      const url = `${config.url}/posts`;
      console.log('this is the post to publish', userPost);
      if (this.$store.state.userPost.text && this.$store.state.userPost.collection) {
        axios.post(url, { userPost }, {
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          this.showNewPost = false;
          // console.log('trying to reset component');
          console.log('response from API is:: ', response.data);
          // TODO must handle response
          this.$store.commit('resetUserPost');
          this.postText = '';
          this.newPostInfo = this.$t('message.published');
          this.snackbarColor = 'green';
          this.snackbarNewPost = true;

          console.log('response from API -is reply to- is:: ', response.data.isReplyTo);
          console.log('totally new post');
          // console.log('this is the userpost newpost:: ', userPost);
          // console.log('emitting to::', members);
          console.log('user post is:: ', JSON.stringify(userPost));

          userPost._id = response.data.id; // eslint-disable-line no-underscore-dangle
          userPost.isReplyTo = response.data.id;
          userPost.isEditor = true;
          if (userPost.userFeatures.length > 0) {
            userPost.featureData = JSON.parse(userPost.userFeatures).features;
          } else {
            userPost.featureData = [];
          }
          userPost.collectionData = [{
            title: this.selectCollection.title,
            _id: this.selectCollection._id, // eslint-disable-line no-underscore-dangle
          }];

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

          // console.log(JSON.parse(userFeats));
          console.log('new post userPost for socket:: ',
          JSON.stringify(userPost), 'res::', response.data.id);
          // console.log('check if feature data present::', JSON.stringify(userPost));
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
      // console.log('post id:: ', this.id);
      if (this.idToMatch === 'reply') {
        this.$store.commit('addingToPost', { type: 'reply', id: this.id });
      }
      if (this.idToMatch === 'home') {
        this.$store.commit('addingToPost', { type: 'home', id: 'home' });
      }
      if (this.idToMatch === 'collection') {
        // console.log({ type: 'collection', id: this.$store.state.openedTimeline.id });
        if (this.$store.state.openedTimeline) {
          this.$store.commit('addingToPost', { type: 'collection', id: this.$store.state.openedTimeline.id });
        }
      }
    },
    zoomToChip(geometry) {
      console.log(geometry);
      const geojsonFormat = new ol.format.GeoJSON();
      const feature = geojsonFormat.readFeatures(geometry);
      console.log(feature);
      const g = feature[0].getGeometry().getExtent();
      console.log(g);
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
      console.log('clicked to remove chip :: ', id);
      olMap.removeFeaturesFromLayer('customLayer', 'mongoID', id);
      this.$store.commit('deleteFeatureFromPost', id);
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
    drawnFeatures: function d() {
      const features = [];
      this.$store.getters.getUserPost.userFeatures.forEach((f) => {
        features.push(JSON.parse(f));
      });
      return features;
    },
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
    computedCollections: function c() {
      let vuexCollections = [];

      this.$store.state.privateCollections.forEach((col) => {
        vuexCollections.push(col);
      });

      this.$store.state.publicCollections.forEach((col) => {
        vuexCollections.push(col);
      });

      // console.log('collections computed:: ', vuexCollections);
      this.selectCollection = vuexCollections[0];
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
      // eslint-disable-next-line
      vuexCollections = vuexCollections.filter(c => c.user === this.$store.state.user._id);
      memberof.forEach((e) => {
        vuexCollections.push(e);
      });
      return vuexCollections;
    },
  },
};
</script>
<style scoped>
  .active {
    background-color: greenyellow;
  }
</style>
