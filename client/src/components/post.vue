<template>
  <v-layout>
    <v-flex xs12 sm12>
      <v-card @newreply="new_post_sent(arguments[0])">
        <v-card-title primary-title>
          <v-flex class="text-xs-left">
            <a md12 @click="exploreTimeline(post.userId)">@{{ post.userName }}: </a>&nbsp;
            <span md12 v-if="post.text" v-html="post.text" v-linkified></span>&nbsp;<br>
            {{ $t("message.inCollection")}}:&nbsp;
            <a md12 @click="exploreCollection(post.collectionData[0]._id)" v-if="post.collectionData[0]">
              {{post.collectionData[0].title}}
            </a>,&nbsp;
            <i>{{moment(parseInt(this.post.timestamp, 0)).format('h:mm:ss a, DD-MM-YYYY')}}</i>
          </v-flex>
        </v-card-title>
        <v-card-actions class="white">
            <v-tooltip bottom>
              <v-btn slot="activator"
                fab small
                v-if='post.userFeatures != "{\"type\":\"FeatureCollection\",\"features\":[]}" && post.userFeatures !== null'
                class="green white--text darken-1"
                @click="explore(post)">
                <!-- {{ $t("message.showOnMap") }} -->
                <v-icon dark>language</v-icon>
              </v-btn>
              <span>{{ $t("message.showOnMapTooltip") }}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn slot="activator"
                fab small
                v-bind:class="[answerPostColor, answerPostTextColor]"
                @click="toggle_answer"
                v-if="$store.state.isUserLoggedIn === true">
                <v-icon large color="white">insert_comment</v-icon>
              </v-btn>
              <span>{{ $t("message.replyTooltip") }}!</span>
            </v-tooltip>
            <v-tooltip bottom v-if="post.replies && replies < 1">
              <v-btn color="green" slot="activator" outline small fab 
                v-if="post.repliesData == undefined && post.replies.length > 0"
                @click="showMoreReplies">
                <v-icon large color="grey">insert_comment</v-icon>
                {{ post.replies.length }}
              </v-btn>
              <span>{{ $t("message.viewReplies") }}</span>
            </v-tooltip>

            <v-progress-circular indeterminate color="primary" v-if='loadingReplies'></v-progress-circular>

            <v-tooltip bottom v-if="socketReplies > 0">
              <v-btn color="blue" slot="activator" outline fab small @click="showSocketReplies">
                +{{ socketReplies }}
              </v-btn>
              <span>{{ $t("message.viewReplies") }}</span>
            </v-tooltip>

              <v-spacer></v-spacer>
              <social-sharing :url="sharePostUrl" inline-template>
                <div>
                  <v-tooltip bottom>
                    <network slot="activator" network="facebook" class="link-network">
                      <i class="fa fa-fw fa-facebook"></i>
                    </network>
                    <span>{{ $t("message.shareOn") }} Facebook!</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <network slot="activator" network="linkedin" class="link-network">
                      <i class="fa fa-fw fa-linkedin"></i>
                    </network>
                    <span>{{ $t("message.shareOn") }} LinkedIn!</span>
                  </v-tooltip>
                </div>
              </social-sharing>
              <v-tooltip bottom>
                <v-btn outline fab small
                  color="black"
                  slot="activator"
                  @click="shareLink = !shareLink; copyToClipboard();"
                  class="link-network">
                  <i class="fa fa-fw fa-link"></i>
                </v-btn>
                <span>{{ $t("message.shareLink") }}!</span>
              </v-tooltip>
        </v-card-actions>
        <newPost v-if="answerPost === true && post.collectionData"
          :id="post._id"
          :collection="post.collectionData[0]._id"
          :collectionMembers="post.collectionData[0].members"
          :userToNotify="post.userId">
        </newPost>

        <!-- <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i>
        <v-flex class="ma-0 pa-0"
          md12
          v-for="post in replies"
          :key="post._id"
        >
          <post :post='post'></post>
        </v-flex> -->

        <v-flex class="ma-0 pa-0"
          md12
          v-if="replies.length > 0"
          v-for="reply in replies"
          :key="reply._id"
        >
          <post :post='reply'></post>
        </v-flex>
        <v-btn block color="white" v-if="replies.length > 0 && replies.length < post.replies.length" @click="showMoreReplies">
          {{ $t('message.loadMore')}}
          <v-progress-circular indeterminate color="primary" v-if='loadingReplies'></v-progress-circular>
        </v-btn>
      </v-card>
    </v-flex>
      <v-snackbar
        :timeout=5000
        v-model="snackbarNewPost"
        :color= "snackbarColor"
      >{{ newPostInfo }}</v-snackbar>

    <v-dialog v-model="shareLink" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ $t("message.shareLink") }}</span>
        </v-card-title>
        <v-card-text>
          <p>{{ $t("message.linkCopied") }}</p>
          <v-btn color="blue darken-1" flat @click.native="shareLink = false">{{ $t("message.close") }}</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
// import { mapActions, mapGetters } from 'vuex';
import ol from 'openlayers';
// import moment from 'moment';
import axios from 'axios';
import clipboard from 'clipboard-copy';
import config from '../config';
import newPost from './new_post';
import olMap from '../js/map';
import styles from '../js/styles';

export default {
  props: ['post'],
  name: 'post',
  data: () => ({
    answerPost: false,
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
    socketReplies: 0,
    shareLink: false,
    shareUrl: '',
    loadingReplies: false,
    answerPostText: '',
    myReplies: 0,
  }),
  components: {
    newPost,
  },
  mounted() {
    // this.answerPostText = this.$t('message.reply');
    this.explore(this.post);
    // this.repliesReversed();
    this.shareUrl = `${config.APIhttpType}://${config.APIhost}:${config.hostPost}/#/main/search/${this.post._id}`; // eslint-disable-line no-underscore-dangle
    this.$options.sockets.newReply = (data) => {
      // console.log('new reply data from server socket:: ', data);
      if (data.isReplyTo === this.post._id) { // eslint-disable-line no-underscore-dangle
        // console.log('must show this reply:: ', data);
        data.socketReply = true; // eslint-disable-line no-param-reassign
        this.$store.dispatch('addReplyToPost', data); // eslint-disable-line no-underscore-dangle
        this.socketReplies += 1;
      }
    };
    this.$eventHub.$on('newReply', (data) => {
      if (this.post._id === data.isReplyTo) { // eslint-disable-line no-underscore-dangle
        this.replies.unshift(data);
        this.toggle_answer();
        this.myReplies += 1;
      }
    });
  },
  methods: {
    showSocketReplies() {
      this.startPage = 0;
      this.limitPage = 10;
      this.replies = [];
      this.showMoreReplies();
    },
    showMoreReplies() {
      if (this.socketReplies > 0 || this.myReplies > 0) {
        this.replies = [];
      }
      this.loadingReplies = true;
      this.socketReplies = 0;
      const serverUrl = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/posts/replies`;
      axios.get(serverUrl, { params: {
        ids: this.post.replies,
        start: this.startPage.toString(),
        end: this.limitPage.toString(),
        userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
      },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        this.fetchedReplies = response.data;
        this.fetchedReplies.forEach((r) => {
          this.replies.push(r);
        });
        // console.log(this.replies);
      }).then(() => {
        // this.loading = false;
        this.loadingReplies = false;
      });
      this.showReplies = true;
      this.startPage += 10;
      this.limitPage += 10;
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
            if (!AddedFeature[0].getProperties().mongoID) {
              alreadyExists = false;
            }
            const g = AddedFeature[0].getGeometry().getExtent();
            if (alreadyExists === false) {
              layer.getSource().addFeatures(AddedFeature);
            }
            if (g[0] - g[2] < 500) {
              g[0] -= 200;
              g[2] += 200;
            }
            if (g[1] - g[3] < 500) {
              g[1] -= 200;
              g[3] += 200;
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
      if (this.answerPost === false) {
        // this.answerPostText = this.$t('message.reply');
        this.answerPostColor = 'green';
        this.$store.commit('addingToPost', undefined);
      } else {
        // this.answerPostText = this.$t('message.cancel');
        this.answerPostColor = 'red';
      }
    },
    new_post_sent(reply) {
      // console.log('event caught::');
      // if (result === 'success') {
      this.newPostInfo = 'Δημοσιεύτηκε η απάντηση!';
      this.snackbarColor = 'green';
      this.snackbarNewPost = true;
      this.$parent.$emit('newreply', reply);
      this.toggle_answer();
      // }
    },
    copyToClipboard() {
      clipboard(this.shareUrl);
    },
    exploreTimeline(userId) {
      const tl = {
        id: userId,
        type: 'timeline',
      };
      this.$store.dispatch('setOpenedCustomTimeline', tl);
      console.log('explore:: ', userId);
      this.$router.push({ path: `/main/search/collection/${userId}` });
    },
    exploreCollection(collectionId) {
      const tl = {
        id: collectionId,
        type: 'collection',
      };
      this.$store.dispatch('setOpenedCustomTimeline', tl);
      console.log('explore:: ', collectionId);
      this.$router.push({ path: `/main/search/collection/${collectionId}` });
    },
  },
  computed: {
    // timestamp() {
    //   return moment(parseInt(this.post.timestamp, 0)).format('lll');
    // },
    sharePostUrl() {
      const url = `${window.location.href}/${this.post._id}`; // eslint-disable-line
      return url;
    },
  },
};
</script>
<style>
  a {
    cursor: pointer;
  }
  .link-network {
    border-style: solid;
    border-width: 1px;
    border-radius: 20px;
    cursor: pointer;
    padding: 1vh;
  }
  .link-network:hover {
    border-style: solid;
    border-color: green;
  }
</style>
