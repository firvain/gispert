<template>
  <v-layout>
    <v-flex xs12 sm12>
      <v-card>
        <v-layout row wrap>
          <v-flex md12>
            <v-text-field @focus="showMapTools"
              autofocus
              name="input-1"
              :label="$t('message.youMayWriteText')"
              :hint="$t('message.youMayWriteAndSketch')"
              v-model="postText"
              id="postText"
              counter
              max="200"
              textarea
              box
            ></v-text-field>
          </v-flex>
        </v-layout>
        <v-flex v-if="drawnFeatures !== undefined">
          <!-- <v-tooltip bottom>
            <v-btn :outline="this.id !== this.$store.state.addingToPost" small fab slot="activator"
              class="indigo--text"
              color="green"
              @click= "showMapTools">
              <v-icon>edit</v-icon>
            </v-btn>
            <span>{{ $t('message.sketchToAddToPost') }}</span>
          </v-tooltip> -->
          <v-chip close v-for="f in drawnFeatures" :key='f.drawId' @input="remove(f.drawId)">
            {{ f.getGeometry().getType() }}
          </v-chip>
        </v-flex>
        <v-card-actions>
          <v-flex  xs6 sm6 md6 v-if="this.id === undefined && this.collection === undefined">
            <v-select
              v-bind:items="computedCollections"
              v-model="selectCollections"
              :label="$t('message.collections')"
              single-line
              item-text="title"
              item-value="_id"
              return-object
              :hint="$t('message.chooseCollection')"
              persistent-hint
            ></v-select>
          </v-flex>
          <v-flex xs6 sm6 md6>
            <v-btn flat class="green white--text darken-1" @click="publishPost">{{ $t('message.publish') }}<v-icon right dark>insert_comment</v-icon></v-btn>
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
  props: ['id', 'collection', 'collectionMembers', 'userToNotify'],
  name: 'newpost',
  data: () => ({
    postText: '',
    toggle_one: 0,
    selectCollections: '',
    collections: [],
    collectionMembersToEmit: {},
    newPostInfo: '',
    snackbarNewPost: false,
    snackbarColor: '',
  }),
  mounted() {
    console.log('new post for reply mounted');
    // if (this.id) {
    //   this.collectionMembersToEmit.members = this.collectionMembers;
    //   console.log('will emit to users:: ', this.collectionMembersToEmit);
    // } else {
    //   this.collectionMembersToEmit.members = this.findMembersOfThisCollection();
    // }
  },
  methods: {
    findMembersOfThisCollection() {
      console.log('find members::', this.$store.state.publicCollections,
        this.$store.state.privateCollections);
      const allCollections =
        this.$store.state.publicCollections.concat(this.$store.state.privateCollections);
      let collectionToFind = '';
      if (this.collection === undefined) {
        collectionToFind =
        this.selectCollections._id; // eslint-disable-line no-underscore-dangle
      } else {
        collectionToFind = this.collection;
      }
      function search(nameKey, myArray) {
        let result = '';
        // console.log('searching for :: ', nameKey);
        for (let i = 0; i < myArray.length; i += 1) {
          console.log(myArray[i].title, myArray[i]._id); // eslint-disable-line no-underscore-dangle
          // eslint-disable-line no-underscore-dangle
          if (myArray[i]._id === nameKey) { // eslint-disable-line no-underscore-dangle
            result = myArray[i];
          }
        }
        return result;
      }
      const result = search(collectionToFind, allCollections);
      console.log('search result, members found:: ', result,
      result.members, result.title, result.user);
      return result;
    },
    publishPost() {
      console.log('PUBLISH');
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
      let idToReply = '';
      if (this.id) {
        idToReply = this.id;
      } else {
        idToReply = '';
      }
      let collectionToPost = 'not in collection';
      if (this.selectCollections._id === undefined) { // eslint-disable-line no-underscore-dangle
        collectionToPost = this.collection;
        // console.log('detected a reply', this.collection);
      } else {
        collectionToPost = this.selectCollections._id; // eslint-disable-line no-underscore-dangle
        // console.log('detected a new post', this.collection);
      }
      const userPost = {
        // eslint-disable-next-line
        userId: this.$store.state.user._id,
        userName: this.$store.state.user.name,
        text: textToPost,
        timestamp: Date.now(),
        userFeatures: userFeats,
        isReplyTo: idToReply,
        collections: collectionToPost, // eslint-disable-line no-underscore-dangle
        // collections: this.selectCollections,
        replies: [],
      };
      // console.log('this is the post to publish', userPost);
      const url = `${config.url}/posts`;
      const members = this.findMembersOfThisCollection();
      console.log('members :: ', JSON.stringify(members));
      if (textToPost !== '' || userFeats !== null) {
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
          if (this.id === undefined) {
            // console.log('totally new post');
            // console.log('this is the userpost newpost:: ', userPost);
            // console.log('emitting to::', members);
            userPost._id = response.data.id; // eslint-disable-line no-underscore-dangle
            userPost.members = members.members; // notify the members TODO: no need, deprecated
            userPost.collectionData = [{
              title: members.title,
              _id: members._id, // eslint-disable-line no-underscore-dangle
            }];
            console.log('new post userPost for socket:: ', JSON.stringify(userPost), 'res::', response.data.id);
            // this.$socket.emit('newPost', userPost);
            userPost.members.push(members.user); // add the creator of the collection
            this.$store.dispatch('addPostToTimeline', userPost);
            if (this.$store.state.openedTimeline &&
              this.$store.state.openedTimeline.type === 'collection'
              && this.$store.state.openedTimeline.id ===
              members._id) { // eslint-disable-line no-underscore-dangle
              this.$store.dispatch('addPostToCollectionView', userPost);
            }
            if (this.$store.state.openedTimeline &&
              this.$store.state.openedTimeline.type === 'timeline'
              && this.$store.state.openedTimeline.id ===
              userPost.userId) { // eslint-disable-line no-underscore-dangle
              console.log('adding the post to userTimeline');
              this.$store.dispatch('addPostToUserTimeline', userPost);
            }
            this.$socket.emit('newPost', userPost);
            this.$eventHub.$emit('newPost', userPost);
          } else {
            // eslint-disable-next-line
            userPost._id = response.data.id;
            // console.log('this is the userpost new reply:: ', userPost);
            // console.log('emitting to::', this.collectionMembers);
            if (this.collectionMembers) {
              userPost.members = this.collectionMembers;
              console.log('collectionMembers:: ', this.collectionMembers);
            } else {
              userPost.members = members.members;
              console.log('members.members:: ', members.members);
            }
            userPost.collectionData = [{ title: members.title,
              _id: response.data.id }]; // eslint-disable-line no-underscore-dangle
            userPost.members.push(this.userToNotify); // add the creator TODO: no need, deprecated
            userPost.isReplyTo = response.data.isReplyTo;
            console.log('reply userPost for socket:: ', JSON.stringify(userPost));
            this.$store.dispatch('addReplyToPost', userPost);
            this.$eventHub.$emit('newReply', userPost);
            this.$socket.emit('newReply', userPost);
          }
        });
      } else {
        this.newPostInfo = this.$t('message.errorNoTextOrSketches');
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
