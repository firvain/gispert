<template>
  <v-layout>
    <v-flex xs12 sm12>
      <v-card>
      <v-layout row wrap>
        <v-flex md10>
          <v-text-field @focus="showMapTools"
            autofocus
            name="input-1"
            label="Νέα ανάρτηση"
            hint="Γράψε εδώ το κείμενό σου"
            v-model="postText"
            id="postText"
            counter
            max="200"
            full-width
            multi-line
          ></v-text-field>
        </v-flex>
        <v-flex md2>
          <div class='text-md-right'>
            <v-btn :outline="this.id !== this.$store.state.addingToPost" medium fab
              class="indigo--text"
              color="green"
              @click= "showMapTools"
              data-tooltip="Σχεδίασε στο χάρτη και θα προστεθεί το σχέδιο στην ανάρτηση!"
              data-tooltip-location="left">
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
          <v-flex xs12 sm6 v-if="this.id === undefined && this.collectionid === undefined">
            <v-select
              v-bind:items="computedCollections"
              v-model="selectCollections"
              label="Συλλογές"
              single-line
              item-text="title"
              item-value="_id"
              return-object
              hint='Διάλεξε συλλογή'
              persistent-hint
            ></v-select>
          </v-flex>
          <v-flex xs12 sm12>
            <v-btn flat class="green white--text darken-1" @click="publishPost">Δημοσιευση<v-icon right dark>insert_comment</v-icon></v-btn>
            <v-btn small fab class="green white--text">
              <v-icon white--text dark>help_outline</v-icon>
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
import olMap from '../js/map';
import config from '../config';

export default {
  props: ['id', 'collection', 'collectionid'],
  name: 'newpost',
  data: () => ({
    postText: '',
    toggle_one: 0,
    selectCollections: '',
    collections: [],
    newPostInfo: '',
    snackbarNewPost: false,
    snackbarColor: '',
  }),
  methods: {
    publishPost() {
      // console.log('PUBLISH');
      const featuresToPost = this.drawnFeatures;
      // console.log('featuresToPost :: ', featuresToPost);
      const textToPost = this.postText;
      let userFeats;
      if (featuresToPost) {
        const geojsonFormat = new ol.format.GeoJSON();
        userFeats = geojsonFormat.writeFeatures(featuresToPost);
        // console.log(userFeats, textToPost);
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
        collections: this.selectCollections._id, // eslint-disable-line no-underscore-dangle
        // collections: this.selectCollections,
        replies: [],
      };
      if (this.collectionid) {
        userPost.collections = this.collectionid;
      }
      // console.log('this is the post to publish', userPost);
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts`;
      if (textToPost !== '' || userFeats !== null) {
        axios.post(url, { userPost }, {
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          // console.log('trying to reset component');
          // console.log(response.data);
          // TODO must handle response
          this.postText = '';
          this.newPostInfo = 'Δημοσιεύτηκε!';
          this.snackbarColor = 'green';
          this.snackbarNewPost = true;

          this.$store.commit('clearNewPostFeatures', 'newPost');
          if (this.id === undefined) {
            // console.log('totally new post');
            this.$parent.$emit('newpost', { type: 'newpost' });
          } else {
            // eslint-disable-next-line
            userPost._id = response.data;
            // console.log('this is the userpost :: ', userPost);
            this.$parent.$emit('newreply', userPost);
          }
        });
      } else {
        this.newPostInfo = 'Δεν υπάρχει κείμενο ή αντικείμενα του χάρτη. Γράψτε ή σχεδιάστε κάτι πριν πατήσετε Δημοσίευση';
        this.snackbarColor = 'red';
        this.snackbarNewPost = true;
      }
    },
    showMapTools() {
      this.$root.$emit('showTools');
      // console.log('post id:: ', this.id);
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
  },
};
</script>
<style scoped>
  .active {
    background-color: greenyellow;
  }
</style>
