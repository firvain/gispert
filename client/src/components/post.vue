<template>
  <v-layout ma-0 pa-0>
    <v-flex xs12 sm12  ma-0 pa-0>
      <!-- <v-card @newreply="new_post_sent(arguments[0])"> -->
      <v-card>
        <v-card-title primary-title>
          <v-icon v-if="postType === 'reply'">reply</v-icon>
          <v-flex class="text-xs-left">
            <a md12 @click="exploreTimeline(post.userId)">@{{ post.userName }}: </a>&nbsp;
            <span md12 v-if="post.text" v-html="post.text" v-linkified></span>&nbsp;<br>
            {{ $t("message.inCollection")}}:&nbsp;
            <a md12 @click="exploreCollection(post.collectionData[0]._id)" v-if="post.collectionData">
              {{post.collectionData[0].title}}
            </a>,&nbsp;
            <i>{{moment(parseInt(this.post.timestamp, 0)).format('h:mm:ss a, DD-MM-YYYY')}}</i>
          </v-flex>
          <v-chip
            v-for="f in post.featureData" 
            v-if="f.properties"
            :key="f.properties.mongoID">
            {{ f.geometry.type }}
          </v-chip>

          <!-- feature data:: {{ post.featureData }} -->
        </v-card-title>
        <v-card-actions class="grey lighten-3">
            <v-tooltip bottom>
              <v-btn slot="activator"
                fab small outline
                v-if='post.featureData.length > 0'
                color="green"
                @click="zoom(post)">
                <!-- {{ $t("message.showOnMap") }} -->
                <v-icon large color='green'>language</v-icon>
              </v-btn>
              <span>{{ $t("message.showOnMapTooltip") }}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn slot="activator"
                fab small outline
                v-bind:color="answerPostColor"
                @click="toggle_answer"
                v-if="$store.state.isUserLoggedIn === true && postType === 'original'">
                <v-icon large :color="answerPostTextColor">insert_comment</v-icon>
              </v-btn>
              <span>{{ $t("message.replyTooltip") }}!</span>
            </v-tooltip>
            <!-- <v-tooltip bottom v-if="post.replies && replies < 1">
              <v-btn color="green" slot="activator" outline small fab
                v-if="post.repliesData == undefined && post.replies.length > 0 && $store.state.isUserLoggedIn === true"
                @click="showMoreReplies">
                <v-icon large color="green">reply</v-icon>
                {{ post.replies.length }}
              </v-btn>
              <span>{{ $t("message.viewReplies") }}</span>
            </v-tooltip> -->

            <v-progress-circular indeterminate color="primary" v-if='loadingReplies'></v-progress-circular>

            <v-tooltip bottom v-if="socketReplies > 0">
              <v-btn color="blue" slot="activator" outline fab small @click="showSocketReplies">
                +{{ socketReplies }}
              </v-btn>
              <span>{{ $t("message.viewReplies") }}</span>
            </v-tooltip>

              <v-spacer></v-spacer>
              <v-menu bottom left>
                <v-btn icon fab outline small color='green' slot="activator">
                  <v-icon color='green'>more_vert</v-icon>
                </v-btn>
                <v-list>
                  <v-list-tile class='hover'>
                    <v-list-tile-title>
                        <v-icon @click="shareLink = !shareLink; copyToClipboard();">link</v-icon>
                        <span
                          @click="shareLink = !shareLink; copyToClipboard();"
                          class='caption'>{{ $t("message.shareLink") }}!
                        </span>
                    </v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile class='hover'>
                    <v-list-tile-title>
                      <social-sharing :url="sharePostUrl" inline-template>
                        <network slot="activator" network="facebook">
                          <i class="fa fa-fw fa-facebook"></i>
                          <span class='caption'>{{ $t("message.shareOn") }} Facebook!</span>
                        </network>
                      </social-sharing>
                    </v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile class='hover'>
                    <v-list-tile-title>
                      <social-sharing :url="sharePostUrl" inline-template>
                        <network slot="activator" network="linkedin">
                          <i class="fa fa-fw fa-linkedin"></i>
                          <span class='caption'>{{ $t("message.shareOn") }} LinkedIn!</span>
                        </network>
                      </social-sharing>
                    </v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>

        </v-card-actions>
        <newReply v-if="answerPost === true"
          :id="post.isReplyTo"
          :collectionId="post.collectionData[0]._id"
          :collectionTitle="post.collectionData[0].title">
        </newReply>
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
import newPost from '@/components/new_post';
import newReply from '@/components/new_reply';
import config from '../config';
import olMap from '../js/map';
import styles from '../js/styles';

export default {
  props: ['post', 'postType'],
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
    loadingReplies: false,
    answerPostText: '',
    myReplies: 0,
  }),
  components: {
    newPost, newReply,
  },
  mounted() {
    // this.answerPostText = this.$t('message.reply');
    this.explore(this.post);
    // this.repliesReversed();
    this.$options.sockets.newReply = (data) => {
      // console.log('new reply data from server socket:: ', data);
      if (data.isReplyTo === this.post._id) { // eslint-disable-line no-underscore-dangle
        // console.log('must show this reply:: ', data);
        data.socketReply = true; // eslint-disable-line no-param-reassign
        this.$store.dispatch('addReplyToThread', data); // eslint-disable-line no-underscore-dangle
        this.socketReplies += 1;
      }
    };
    this.$eventHub.$on('newReply', (data) => {
      if (this.post.isReplyTo === data.isReplyTo && this.postType === 'original') { // eslint-disable-line no-underscore-dangle
        this.toggle_answer();
        // this.replies.unshift(data);
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
      const serverUrl = `${config.url}/posts/replies`;
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
      if (post.featureData.length > 0) {
        const geojsonFormat = new ol.format.GeoJSON();
        const featureCollection = {
          type: 'FeatureCollection',
          features: post.featureData,
        };
        console.log('adding a post feature data:: ', JSON.stringify(featureCollection));
        const featuresToLoad = geojsonFormat.readFeatures(JSON.stringify(featureCollection));
        if (featuresToLoad.length > 0) {
          let allLayers = [];
          allLayers = olMap.getLayers().getArray();
          allLayers.forEach((layer) => {
            if (layer.getProperties().name === 'customLayer') {
              featuresToLoad.forEach((f) => {
                let alreadyExists = false;
                layer.getSource().forEachFeature((feature) => {
                  if (feature.get('mongoID') === f.getProperties().mongoID) {
                    alreadyExists = true;
                  }
                });
                if (!alreadyExists) {
                  let message = '';
                  if (post.text.length > 20) {
                    message = `${post.text.substr(0, 20)}...`;
                  } else {
                    message = post.text;
                  }
                  f.setProperties({
                    messages: message,
                  });
                  console.log('added feature :: ', f);
                  layer.getSource().addFeature(f);
                  const cs = f.getStyle();
                  f.setStyle(styles.BoldLineString);
                  setTimeout(() => {
                    f.setStyle(cs);
                    olMap.updateSize();
                  }, 500);
                }
              });
            }
          });
        }
      }
    },
    zoom(post) {
      const geojsonFormat = new ol.format.GeoJSON();
      const featureCollection = {
        type: 'FeatureCollection',
        features: post.featureData,
      };
      console.log('zooming to a post feature data:: ', JSON.stringify(featureCollection));
      const featuresToLoad = geojsonFormat.readFeatures(JSON.stringify(featureCollection));
      const g = featuresToLoad[0].getGeometry().getExtent();
      if (g[0] - g[2] < 500) {
        g[0] -= 200;
        g[2] += 200;
      }
      if (g[1] - g[3] < 500) {
        g[1] -= 200;
        g[3] += 200;
      }
      olMap.getView().fit(g, olMap.getSize());
      const cs = featuresToLoad[0].getStyle();

      featuresToLoad[0].setStyle(styles.BoldLineString);

      setTimeout(() => {
        featuresToLoad[0].setStyle(cs);
        olMap.updateSize();
      }, 500);
    },
    toggle_answer() {
      console.log('toggling answer box');
      this.answerPost = !this.answerPost;
      if (this.answerPost === false) {
        // this.answerPostText = this.$t('message.reply');
        this.answerPostColor = 'green';
        this.$store.commit('setActiveMapTool', 'selectFeatures');
      } else {
        // this.answerPostText = this.$t('message.cancel');
        this.$store.commit('setActiveMapTool', 'drawFeatures');
        this.answerPostColor = 'red';
      }
    },
    // new_post_sent(reply) {
    //   // console.log('event caught::');
    //   // if (result === 'success') {
    //   this.newPostInfo = 'Δημοσιεύτηκε η απάντηση!';
    //   this.snackbarColor = 'green';
    //   this.snackbarNewPost = true;
    //   this.$parent.$emit('newreply', reply);
    //   this.toggle_answer();
    //   // }
    // },
    copyToClipboard() {
      clipboard(this.sharePostUrl);
    },
    exploreTimeline(userId) {
      const tl = {
        id: userId,
        type: 'timeline',
      };
      this.$store.dispatch('setOpenedCustomTimeline', tl);
      console.log('explore:: ', userId);
      this.$store.commit('setActiveTab', 'explore');
      // this.$router.push({ path: `/main/search/usertimeline/${userId}` });
    },
    exploreCollection(collectionId) {
      const tl = {
        id: collectionId,
        type: 'collection',
      };
      this.$store.dispatch('setOpenedCustomTimeline', tl);
      console.log('explore:: ', collectionId);
      this.$store.commit('setActiveTab', 'explore');
      // this.$router.push({ path: `/main/search/collection/${collectionId}` });
    },
  },
  computed: {
    // timestamp() {
    //   return moment(parseInt(this.post.timestamp, 0)).format('lll');
    // },
    sharePostUrl() {
      const url = `${config.share}/#/post/${this.post._id}`; // eslint-disable-line
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
  .hover:hover {
    background-color: lightgrey;
  }
</style>
