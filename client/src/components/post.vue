<template>
  <v-layout ma-0 pa-0>
    <v-flex xs12 sm12 ma-0 pa-0>
      <!-- <v-card @newreply="new_post_sent(arguments[0])"> -->
      <v-card>
        <v-card-title primary-title>
          <v-icon v-if="postType === 'reply'" color="primary" x-large
            >forum</v-icon
          >
          <v-flex :class="postClass">
            <a md12 @click="exploreTimeline(post.userId)"
              >@{{ post.userName }}: </a
            >&nbsp;
            <span v-if="post.text" v-linkified md12>{{ post.text }}</span
            >&nbsp;<br />
            <span v-if="postType !== 'reply'"
              >{{ $t("message.inCollection") }}:&nbsp;</span
            >
            <a
              v-if="post.collectionData && postType !== 'reply'"
              md12
              @click="exploreCollection(post.collectionData[0])"
            >
              {{ post.collectionData[0].title }}, </a
            >&nbsp;
            <i>{{
              moment(parseInt(this.post.timestamp)).format(
                "h:mm:ss a, DD-MM-YYYY"
              )
            }}</i>
          </v-flex>
          <v-chip
            v-for="f in post.featureData"
            :key="f.properties.mongoID"
            @click="zoomToChip(f)"
          >
            {{ geometryTypeText(f.geometry.type) }}
          </v-chip>
          <!-- feature data:: {{ post.featureData }} -->
        </v-card-title>

        <v-carousel v-if="post.images" hide-controls lazy>
          <v-carousel-item
            :src="post.images"
            @click="showLargeImage(post.images)"
          >
          </v-carousel-item>
        </v-carousel>
        <iframe
          v-if="post.videos"
          width="560"
          height="315"
          :src="`https://www.youtube.com/embed/${post.videos}`"
          frameborder="0"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        >
        </iframe>

        <v-card-actions :class="isSelected">
          <v-tooltip bottom>
            <v-btn
              v-if="post.featureData.length > 0"
              slot="activator"
              fab
              small
              outline
              color="green"
              @click="zoom(post)"
            >
              <!-- {{ $t("message.showOnMap") }} -->
              <v-icon color="green">location_on</v-icon>
            </v-btn>
            <span>{{ $t("message.showOnMapTooltip") }}</span>
          </v-tooltip>

          <v-tooltip bottom>
            <v-btn
              v-if="showAnswerButton"
              slot="activator"
              fab
              small
              outline
              :color="answerPostColor"
              @click="toggle_answer"
            >
              <v-icon :color="answerPostTextColor">chat</v-icon>
            </v-btn>
            <span>{{ $t("message.replyTooltip") }}!</span>
          </v-tooltip>
          <!-- <v-tooltip bottom v-if="post.replies && replies < 1">
              <v-btn color="green" slot="activator" outline small fab
                v-if="post.repliesData == undefined && post.replies.length > 0 && $store.state.isUserLoggedIn === true"
                @click="showMoreReplies">
                <v-icon color="green">reply</v-icon>
                {{ post.replies.length }}
              </v-btn>
              <span>{{ $t("message.viewReplies") }}</span>
            </v-tooltip> -->

          <v-progress-circular
            v-if="loadingReplies"
            indeterminate
            color="primary"
          ></v-progress-circular>

          <v-tooltip v-if="socketReplies > 0" bottom>
            <v-btn
              slot="activator"
              color="blue"
              outline
              fab
              small
              @click="showSocketReplies"
            >
              +{{ socketReplies }}
            </v-btn>
            <span>{{ $t("message.viewReplies") }}</span>
          </v-tooltip>

          <!-- <v-spacer></v-spacer>
              <v-menu bottom left v-if="postType === 'original'">
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
              </v-menu> -->
        </v-card-actions>
        <newReply
          v-if="
            $store.state.userPost.type === 'reply' &&
              $store.state.userPost.isReplyTo === post.isReplyTo
          "
          :id="post.isReplyTo"
          :collection-id="post.collectionData[0]._id"
          :collection-title="post.collectionData[0].title"
          @closeReply="toggle_answer"
        >
        </newReply>
      </v-card>
    </v-flex>
    <v-snackbar
      v-model="snackbarNewPost"
      :timeout="5000"
      :color="snackbarColor"
      >{{ newPostInfo }}</v-snackbar
    >

    <v-dialog v-model="shareLink" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ $t("message.shareLink") }}</span>
        </v-card-title>
        <v-card-text>
          <p>{{ $t("message.linkCopied") }}</p>
          <v-btn color="blue darken-1" text @click.native="shareLink = false">{{
            $t("message.close")
          }}</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      v-if="post.images"
      v-model="largeImageBox"
      persistent
      max-width="800px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ post.text }}</span>
        </v-card-title>
        <v-card-text>
          <v-carousel hide-controls lazy>
            <v-carousel-item
              :src="post.images"
              @click="showLargeImage(post.images)"
            >
            </v-carousel-item>
          </v-carousel>
          <v-btn
            color="blue darken-1"
            text
            @click.native="largeImageBox = false"
            >{{ $t("message.close") }}</v-btn
          >
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
// import { mapActions, mapGetters } from 'vuex';
import ol from "openlayers";
// import moment from 'moment';
import axios from "axios";
import clipboard from "clipboard-copy";
// import { LazyComponent } from 'vue-lazyload';
import newReply from "@/components/new_reply";
import config from "../config";
import olMap from "../js/map";
import styles from "../js/styles";

export default {
  name: "Post",
  components: {
    newReply // LazyComponent,
  },
  props: ["post", "postType"],
  data: () => ({
    answerPost: false,
    answerPostColor: "blue",
    answerPostTextColor: "white--text darken-1",
    newPostInfo: "",
    snackbarNewPost: false,
    snackbarColor: "",
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
    answerPostText: "",
    myReplies: 0,
    isSelected: "grey lighten-3",
    largeImageBox: false
  }),
  computed: {
    // timestamp() {
    //   return moment(parseInt(this.post.timestamp, 0)).format('lll');
    // },
    showAnswerButton() {
      let show;
      // if (this.$store.state.isUserLoggedIn === true
      //     && this.postType === 'original'
      //     && this.$store.state.openedTimeline
      //     && this.$store.state.openedTimeline.isEditor
      //     && this.$store.state.activeTab === 'explore') {
      //   show = true;
      // }
      if (
        this.$store.state.isUserLoggedIn === true &&
        this.postType === "original" &&
        this.post.collectionData[0].isEditor
      ) {
        show = true;
      }
      return show;
    },
    postClass() {
      return this.postType === "reply" ? "text-xs-right" : "text-xs-left";
    },
    sharePostUrl() {
      const url = `${config.share}/post/${this.post._id}`; // eslint-disable-line
      return url;
    }
  },
  watch: {
    "$store.state.selectedPost": function set() {
      let isActive;
      if (this.post._id === this.$store.state.selectedPost) { // eslint-disable-line
        isActive = "orange lighten-3";
      } else {
        isActive = "grey lighten-3";
      }
      this.isSelected = isActive;
    }
  },
  mounted() {
    // this.answerPostText = this.$t('message.reply');
    this.explore(this.post);
    // this.repliesReversed();
    this.$options.sockets.newReply = data => {
      // console.log('new reply data from server socket:: ', data);
      if (data.isReplyTo === this.post._id) {
        // eslint-disable-line no-underscore-dangle
        // console.log('must show this reply:: ', data);
        data.socketReply = true; // eslint-disable-line no-param-reassign
        this.$store.dispatch("addReplyToThread", data); // eslint-disable-line no-underscore-dangle
        this.socketReplies += 1;
      }
    };
    this.$eventHub.$on("newReply", data => {
      if (
        this.post.isReplyTo === data.isReplyTo &&
        this.postType === "original"
      ) {
        // eslint-disable-line no-underscore-dangle
        this.toggle_answer();
        // this.replies.unshift(data);
        this.myReplies += 1;
      }
    });
    this.$eventHub.$on("loadTimelineFeatures", () => {
      this.explore(this.post);
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
      axios
        .get(serverUrl, {
          params: {
            ids: this.post.replies,
            start: this.startPage.toString(),
            end: this.limitPage.toString(),
            userId: this.$store.state.user._id // eslint-disable-line no-underscore-dangle
          },
          headers: { "x-access-token": this.$store.state.token }
        })
        .then(response => {
          this.fetchedReplies = response.data;
          this.fetchedReplies.forEach(r => {
            this.replies.push(r);
          });
          // console.log(this.replies);
        })
        .then(() => {
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
          type: "FeatureCollection",
          features: post.featureData
        };
        // console.log('adding a post feature data:: ', JSON.stringify(featureCollection));
        const featuresToLoad = geojsonFormat.readFeatures(
          JSON.stringify(featureCollection)
        );
        if (featuresToLoad.length > 0) {
          let allLayers = [];
          allLayers = olMap.getLayers().getArray();
          allLayers.forEach(layer => {
            if (layer.getProperties().name === "customLayer") {
              featuresToLoad.forEach(f => {
                let alreadyExists = false;
                layer.getSource().forEachFeature(feature => {
                  if (feature.get("mongoID") === f.getProperties().mongoID) {
                    alreadyExists = true;
                  }
                });
                if (!alreadyExists) {
                  let message = "";
                  if (post.text.length > 20) {
                    message = `${post.text.substr(0, 20)}...`;
                  } else {
                    message = post.text;
                  }
                  f.setProperties({
                    messages: message
                  });
                  // console.log('added feature :: ', f);
                  layer.getSource().addFeature(f);
                  const labelNormal = new ol.style.Style({
                    text: new ol.style.Text({
                      font: "bold 10px Verdana",
                      text: message,
                      fill: new ol.style.Fill({
                        color: "blue"
                      }),
                      stroke: new ol.style.Stroke({
                        color: "white",
                        width: 3.5
                      }),
                      offsetY: -15
                    })
                  });
                  f.setStyle([
                    styles.Point,
                    styles.LineString,
                    styles.Polygon,
                    labelNormal
                  ]);
                }
              });
            }
          });
        }
      }
    },
    zoom(post) {
      this.explore(post);
      this.$store.commit('setSelectedPost', this.post._id); // eslint-disable-line
      const geojsonFormat = new ol.format.GeoJSON();
      const featureCollection = {
        type: "FeatureCollection",
        features: post.featureData
      };
      const allIdsFromFeatureCollection = [];
      post.featureData.forEach(f => {
        allIdsFromFeatureCollection.push(f.properties.mongoID);
      });
      console.log(
        "zooming to a post feature data:: ",
        JSON.stringify(featureCollection)
      );
      const featuresToLoad = geojsonFormat.readFeatures(
        JSON.stringify(featureCollection)
      );
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
      // const cs = featuresToLoad[0].getStyle();

      let features = [];
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach(layer => {
        if (layer.getProperties().name === "customLayer") {
          features = layer.getSource().getFeatures();
          if (features.length === 0) {
            this.explore(post);
          }
        }
      });
      features.forEach(f => {
        let message = "";
        if (f.get("messages").length > 20) {
          message = `${f.get("messages").substr(0, 20)}...`;
        } else {
          message = f.get("messages");
        }
        if (allIdsFromFeatureCollection.includes(f.getProperties().mongoID)) {
          console.log(message);
          const labelSelected = new ol.style.Style({
            text: new ol.style.Text({
              font: "bold 14px Verdana",
              text: message,
              fill: new ol.style.Fill({
                color: "orange"
              }),
              stroke: new ol.style.Stroke({
                color: "red",
                width: 2
              }),
              offsetY: -15
            })
          });
          f.setStyle([
            styles.selectedPoint,
            styles.selectedLineString,
            styles.selectedPolygon,
            labelSelected
          ]);
        } else {
          const labelNormal = new ol.style.Style({
            text: new ol.style.Text({
              font: "bold 10px Verdana",
              text: message,
              fill: new ol.style.Fill({
                color: "blue"
              }),
              stroke: new ol.style.Stroke({
                color: "white",
                width: 3.5
              }),
              offsetY: -15
            })
          });
          f.setStyle([
            styles.Point,
            styles.LineString,
            styles.Polygon,
            labelNormal
          ]);
        }
      });

      // setTimeout(() => {
      //   featuresToLoad[0].setStyle(cs);
      //   olMap.updateSize();
      // }, 500);
    },
    zoomToChip(data) {
      this.$store.commit('setSelectedPost', this.post._id); // eslint-disable-line
      const geojsonFormat = new ol.format.GeoJSON();
      console.log("zooming to a post feature data:: ", JSON.stringify(data));
      const featuresToLoad = geojsonFormat.readFeatures(JSON.stringify(data));
      console.log("zooming to a post feature data:: ", featuresToLoad);
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
      // const cs = featuresToLoad[0].getStyle();

      let features = [];
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach(layer => {
        if (layer.getProperties().name === "customLayer") {
          features = layer.getSource().getFeatures();
          if (features.length === 0) {
            this.explore(this.post);
          }
        }
      });
      features.forEach(f => {
        // let message = '';
        // if (f.get('messages').length > 20) {
        //   message = `${f.get('messages').substr(0, 20)}...`;
        // } else {
        //   message = f.get('messages');
        // }
        if (data.properties.mongoID === f.getProperties().mongoID) {
          // console.log(message);
          const labelSelected = new ol.style.Style({
            text: new ol.style.Text({
              font: "bold 14px Verdana",
              // text: message,
              fill: new ol.style.Fill({
                color: "orange"
              }),
              stroke: new ol.style.Stroke({
                color: "red",
                width: 2
              }),
              offsetY: -15
            })
          });
          f.setStyle([
            styles.selectedPoint,
            styles.selectedLineString,
            styles.selectedPolygon,
            labelSelected
          ]);
        } /* else {
          const labelNormal = new ol.style.Style({
            text: new ol.style.Text({
              font: 'bold 10px Verdana',
              text: message,
              fill: new ol.style.Fill({
                color: 'blue',
              }),
              stroke: new ol.style.Stroke({
                color: 'white',
                width: 3.5,
              }),
              offsetY: -15,
            }),
          });
          f.setStyle([styles.Point, styles.LineString, styles.Polygon, labelNormal]);
        } */
      });

      // setTimeout(() => {
      //   featuresToLoad[0].setStyle(cs);
      //   olMap.updateSize();
      // }, 500);
    },
    toggle_answer() {
      this.$store.commit("resetUserPost");
      this.$store.commit("setUserPostProperties", [
        { property: "userName", value: `${this.$store.state.user.name}` }
      ]);
      this.$store.commit("setUserPostProperties", [
        { property: "userId", value: `${this.$store.state.user._id}` }
      ]); // eslint-disable-line no-underscore-dangle
      this.$store.commit("setUserPostProperties", [
        { property: "type", value: "reply" }
      ]);
      this.$store.commit("setUserPostProperties", [
        { property: "isReplyTo", value: this.post.isReplyTo }
      ]);
      this.$store.commit("setUserPostProperties", [
        { property: "collection", value: this.post.collectionData[0]._id }
      ]); // eslint-disable-line no-underscore-dangle
      olMap.setActiveInteraction("select");
      console.log("toggling answer box");
    },
    copyToClipboard() {
      clipboard(this.sharePostUrl);
    },
    exploreTimeline(userId) {
      const tl = {
        id: userId,
        type: "timeline"
      };
      this.$store.dispatch("setOpenedCustomTimeline", tl);
      console.log("explore:: ", userId);
      this.$store.commit("setActiveTab", "explore");
      // this.$router.push({ path: `/main/search/usertimeline/${userId}` });
    },
    exploreCollection(collection) {
      const tl = {
        id: collection._id, // eslint-disable-line no-underscore-dangle
        type: "collection",
        title: collection.title,
        visibility: collection.visibility,
        userCreated: collection.user,
        isEditor: collection.isEditor
      };
      this.$store.dispatch("setOpenedCustomTimeline", tl);
      console.log("explore:: ", collection.id);
      this.$store.commit("setActiveTab", "explore");
      // this.$router.push({ path: `/main/search/collection/${collectionId}` });
    },
    geometryTypeText(geom) {
      let text;
      if (geom === "Point") {
        text = "Σημείο";
      }
      if (geom === "LineString") {
        text = "Γραμμή";
      }
      if (geom === "Polygon") {
        text = "Πολύγωνο";
      }
      return text;
    },
    showLargeImage() {
      this.largeImageBox = true;
      console.log("image clicked");
    }
  }
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
