<template>
  <div id='mw' class="mapStyle">
    <link rel="stylesheet" href="https://unpkg.com/vue-swatches/dist/vue-swatches.min.css">
    <!-- <mapTools></mapTools> -->
    <div id='mapDiv' class="mapStyle"></div>
    <div id="popup" class="ol-popup">
      <!-- <a href="#" id="popup-closer" class="ol-popup-closer"></a> -->
      <div id="popup-content">
        <mapTools></mapTools>
      </div>
    </div>
    <v-container xs3 md3 class="floating-bottom">
      <v-btn @click="setBasemap('bing')">Aerial</v-btn>
      <v-btn @click="setBasemap('esri')">Road</v-btn>
    </v-container>
    <!-- <v-container xs3 md3 class="floating-bottom chat" v-if="currentlySelectedFeature !=='undefined' && currentlySelectedFeature !== null && this.$store.state.isUserLoggedIn"> -->
      <!-- <v-expansion-panel>
        <v-expansion-panel-content>
          <div slot="header">{{ $t("message.symbologyStyle")}}</div>
          <div class="custom-ui-class">
            <v-flex md12>
              {{ $t("message.outlineColor")}}
              <swatches
                v-model="outlineColor"
                inline
                swatch-size='16'
                @input="outlineColorChanged"
              ></swatches>
              {{ $t("message.fillColor")}}
              <swatches
                v-model="fillColor"
                inline
                swatch-size='16'
                @input="fillColorChanged"
              ></swatches>
              <v-layout row wrap>
                {{ $t("message.strokeWidth")}}
                <v-flex md8>
                  <v-slider
                    color="orange"
                    min="1"
                    max="8"
                    thumb-label
                    v-model="strokeWidth"
                    :rules="strokeWidthRule"
                  ></v-slider>
                </v-flex>
                <v-flex md2 
                  v-show="$store.state.feature.get('userId') === $store.state.user._id && saveButtonShow && $store.state.addingToPost === undefined"
                >
                  <v-btn fab dark small
                    color="green"
                    @click="saveSymbology()">
                    <v-icon dark>save</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-flex>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel> -->
      <!-- <div class="message-list">
        <v-progress-circular v-show='loading' indeterminate v-bind:width="3" color="blue"></v-progress-circular>
        <div class="" v-for="(message, index) in messages" v-bind:key="index">
          <chat :message= 'message'></chat>
        </div>
        <v-btn
          v-if="$store.state.isUserLoggedIn && endOfMessages === false"
          v-on:click='messagesStart += 25; messagesEnd += 25; loadConversation()'
          class="blue-grey white--text"
          block
        >
          {{ $t("message.loadMore")}}
          <v-icon right dark>navigate_next</v-icon>
        </v-btn>
      
      </div> -->
      <!-- <v-layout row>
      <v-flex xs10 md10>
        <v-text-field
          name="input-1"
          :label="$t('message.newMessage')"
          id="testing"
          width='50'
          v-on:keyup.enter="sendMessage"
          v-model="message_content"
        ></v-text-field>
      </v-flex>
      <v-flex xs2 md2>
        <v-btn fab dark small color="green">
          <v-icon dark>send</v-icon>
        </v-btn>
      </v-flex>
      </v-layout> -->
    <!-- </v-container>  -->
  </div>
</template>
<script>
import ol from 'openlayers';
// import axios from 'axios';
import Swatches from 'vue-swatches';
// import 'vue-swatches/dist/vue-swatches.min.css';
import chat from './chat';
// import config from '../config';
import styles from '../js/styles';
import olMap from '../js/map';
import mapTools from './maptoolsanalysis';

export default {
  name: 'mw',
  data: () => ({
    message_content: '',
    items: [],
    messages: [],
    usersChatting: [],
    messagesStart: 0,
    messagesEnd: 25,
    featuresStart: 0,
    featuresEnd: 25,
    endOfMessages: true,
    colorPicker: '',
    strokeWidthRule: [
      val => val < 10 || 'I believe you!',
    ],
    outlineColor: '',
    fillColor: '',
    strokeWidth: '',
    outlineColorChange: false,
    fillColorChange: false,
    strokeWidthChange: false,
    saveButtonShow: false,
  }),
  components: {
    mapTools, olMap, chat, Swatches,
  },
  computed: {
    newFeature() {
      return this.$store.state.newpostfeature;
    },
    currentlySelectedFeature() {
      let feature = {};
      if (typeof this.$store.state.feature !== 'undefined') {
        feature = this.$store.state.feature;
      } else {
        feature = null;
      }
      return feature;
    },
    // currentMessages() {
    //   let messages = '';
    //   if (Object.keys(this.$store.state.feature).length > 0) {
    //     const featureKeys = this.$store.state.feature.getKeys();
    //     if (featureKeys.indexOf('messages') > 0) {
    //       messages = [];
    //       messages = this.$store.state.feature.get('messages').split('\n');
    //     }
    //   } else {
    //     messages = [];
    //   }
    //   this.messages = this.$store.state.feature.get('messages').split('\n');
    //   return messages;
    // },
  },
  methods: {
    setBasemap(basemap) {
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach((layer) => {
        if (layer.getProperties().name === basemap) {
          layer.setVisible(true);
        }
        if (layer.getProperties().name !== basemap && layer.getProperties().name !== 'customLayer') {
          layer.setVisible(false);
        }
      });
    },
    // sendMessage() {
    //   if (this.content !== '') {
    //     const message = {
    //       userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
    //       userName: this.$store.state.user.name,
    //       content: this.message_content,
    //       date: new Date(),
    //       featureId: this.$store.state.feature.get('mongoID'),
    //     };
    //     this.$socket.emit('featureMessage', message);
    //     this.addToConversation(message).then(() => {
    //       this.loading = false;
    //     });
    //     this.messages.unshift(message);
    //     console.log('feature message emitted::', JSON.stringify(message));
    //     this.message_content = '';
    //   }
    // },
    // outlineColorChanged() {
    //   console.log('outline color changed');
    //   this.outlineColorChange = true;
    //   this.setSymbology();
    // },
    // fillColorChanged() {
    //   console.log('fill color changed');
    //   this.fillColorChange = true;
    //   this.setSymbology();
    // },
    // newFeatureMessage(msg) {
    //   let allLayers = [];
    //   allLayers = olMap.getLayers().getArray();
    //   allLayers.forEach((layer) => {
    //     if (layer.getProperties().name === 'customLayer') {
    //       let alreadyExists = false;
    //       layer.getSource().forEachFeature((feature) => {
    //         console.log('feature to add:: ', JSON.stringify(msg));
    //         if (feature.get('mongoID') === msg.featureId) {
    //           alreadyExists = true;
    //           console.log('setting properties', msg.userName, msg.content);
    //           feature.setProperties({ messages: `${msg.userName}: ${msg.content}` });
    //           this.messages.unshift(msg);
    //         }
    //       });
    //       if (alreadyExists === false) {
    //         console.log('must ajax it');
    //       }
    //     }
    //   });
    // },
    // addNewGeometry(msg) {
    //   console.log('adding new geometry from livegeodata', JSON.stringify(msg));
    //   const geojsonFormat = new ol.format.GeoJSON();
    //   const AddedFeature = geojsonFormat.readFeatures(JSON.stringify(msg));
    //   let allLayers = [];
    //   allLayers = olMap.getLayers().getArray();
    //   allLayers.forEach((layer) => {
    //     if (layer.getProperties().name === 'customLayer') {
    //       let alreadyExists = false;
    //       // console.log('added feature::', AddedFeature[0]);
    //       layer.getSource().forEachFeature((feature) => {
    //         if (feature.get('mongoID') === AddedFeature[0].getProperties().mongoID) {
    // eslint-disable-line no-underscore-dangle
    //           alreadyExists = true;
    //         }
    //       });
    //       if (alreadyExists === false) {
    //         layer.getSource().addFeatures(AddedFeature);
    //       }
    //     }
    //   });
    // },
    // newGeometryDrawn(feature) {
    //   console.log('send this feature to db:: ', feature);
    //   try {
    //     const url = `${config.url}/features/feature`;
    //     axios.post(url, { feature }, { headers: { 'x-access-token': this.$store.state.token } });
    //   } catch (error) {
    //     console.log(error);
    //   }
    //   return true;
    // },
    // async loadLiveGeodata() {
    //   try {
    //     const url = `${config.url}/features/feature`;
    //     console.log('load live geodata for::', this.$store.state.liveUsersList);
    //     const users = this.$store.state.liveUsersList;
    //     // console.log(users, typeof (users));
    //     axios.get(url, {
    //       params: {
    //         userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
    //         userList: users,
    //         start: this.featuresStart,
    //         end: this.featuresEnd,
    //       },
    //       headers: { 'x-access-token': this.$store.state.token },
    //     }).then((response) => {
    //       console.log('response status:: ', response.status);
    //       if (response.status === 200) {
    //         if (response.data.length > 0) {
    //           console.log('data:: ', response.data);
    //           response.data.forEach((f) => {
    //             // console.log('message:: ', f.feature);
    //             this.addNewGeometry(f.feature);
    //           });
    //         }
    //       } else {
    //         console.log('error');
    //       }
    //     });
    //   } catch (error) {
    //     console.log(error);
    //   }
    //   return true;
    // },
    // async loadConversation(newSelection) {
    //   try {
    //     if (newSelection) {
    //       this.messages = [];
    //     }
    //     if (this.$store.state.feature) {
    //       const url = `${config.url}/conversations`;
    //       axios.get(url, {
    //         params: {
    //           featureId: this.$store.state.featureId,
    //           start: this.messagesStart,
    //           end: this.messagesEnd,
    //         },
    //         headers: { 'x-access-token': this.$store.state.token },
    //       }).then((response) => {
    //         console.log('response status:: ', response.status);
    //         if (response.status === 200 && response.data.length > 0) {
    //           console.log('data:: ', response.data);
    //           response.data.forEach((r) => {
    //             // console.log('message:: ', r.message);
    //             this.messages.push(r.message);
    //           });
    //           if (response.data.length < 25) {
    //             this.endOfMessages = true;
    //           } else {
    //             this.endOfMessages = false;
    //           }
    //         } else {
    //           this.endOfMessages = true;
    //           this.loading = false;
    //           console.log('error', this.loading);
    //         }
    //       });
    //     }
    //   } catch (error) {
    //     console.log(error);
    //   }
    //   return true;
    // },
    // async addToConversation(data) {
    //   try {
    //     const url = `${config.url}/conversations`;
    //     axios.post(url, { data }, {
    //       headers: { 'x-access-token': this.$store.state.token },
    //     }).then((response) => {
    //       if (response.status === 200) {
    //         this.loading = false;
    //       } else {
    //         console.log('error');
    //       }
    //     });
    //   } catch (error) {
    //     console.log(error);
    //   }
    //   return true;
    // },
    // setSymbology() {
    //   this.saveButtonShow = true;
    //   let allLayers = [];
    //   allLayers = olMap.getLayers().getArray();
    //   allLayers.forEach((layer) => {
    //     if (layer.getProperties().name === 'customLayer') {
    //       // console.log('added feature::', AddedFeature[0]);
    //       layer.getSource().forEachFeature((feature) => {
    //         if (feature.get('mongoID') === this.$store.state.featureId) {
    //           feature.setProperties({
    //             strkWdth: this.strokeWidth,
    //             strkClr: this.outlineColor,
    //             fllClr: this.fillColor,
    //           });
    //         }
    //       });
    //     }
    //   });
    // },
    // setSymbologyFromSocket(data) {
    //   let allLayers = [];
    //   allLayers = olMap.getLayers().getArray();
    //   allLayers.forEach((layer) => {
    //     if (layer.getProperties().name === 'customLayer') {
    //       // console.log('added feature::', AddedFeature[0]);
    //       layer.getSource().forEachFeature((feature) => {
    //         if (feature.get('mongoID') === data.featureId) {
    //           console.log('found the feature and setting properties', data);
    //           if (this.outlineColorChange) {
    //             feature.setProperties({
    //               strkClr: data.strkClr,
    //             });
    //           }
    //           if (this.fillColorChange) {
    //             feature.setProperties({
    //               fllClr: data.fllClr,
    //             });
    //           }
    //           if (this.strokeWidthChange) {
    //             feature.setProperties({
    //               strkWdth: data.strkWdth,
    //             });
    //           }
    //           console.log('set properties', feature.getProperties());
    //         }
    //       });
    //     }
    //   });
    // },
    // saveSymbology() {
    //   try {
    //     const url = `${config.url}/features/setsymbology`;
    //     const data = {
    //       featureId: this.$store.state.featureId,
    //       strkWdth: this.strokeWidth,
    //       strkClr: this.outlineColor,
    //       fllClr: this.fillColor,
    //     };
    //     if (this.outlineColorChange) {
    //       data.strkClr = data.strkClr;
    //     }
    //     if (this.fillColorChange) {
    //       data.fllClr = data.fllClr;
    //     }
    //     if (this.strokeWidthChange) {
    //       data.strkWdth = data.strkWdth;
    //     }
    //     axios.post(url, { data }, {
    //       headers: { 'x-access-token': this.$store.state.token },
    //     }).then((response) => {
    //       data.userId = this.$store.state.user._id; // eslint-disable-line no-underscore-dangle
    //       if (response.status === 200) {
    //         this.$socket.emit('setSymbology', data);
    //         console.log('OK');
    //       } else {
    //         console.log('error');
    //       }
    //     });
    //   } catch (error) {
    //     console.log(error);
    //   }
    //   return true;
    // },
    // resetSymbologyMenu() {
    //   this.saveButtonShow = false;
    //   this.outlineColor = '';
    //   this.fillColor = '';
    //   this.strokeWidth = 1;
    //   this.outlineColorChange = false;
    //   this.fillColorChange = false;
    //   this.strokeWidthChange = false;
    // },
  },
  watch: {
    '$store.state.feature': function handle() {
      console.log('new feature selection');
      let allLayers = [];
      let features = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach((layer) => {
        if (layer.getProperties().name === 'customLayer') {
          features = layer.getSource().getFeatures();
        }
      });
      features.forEach((f) => {
        let message = '';
        if (f.get('messages') && f.get('messages').length > 20) {
          message = `${f.get('messages').substr(0, 20)}...`;
        }
        if (f.get('messages') && f.get('messages').length < 20) {
          message = f.get('messages');
        }
        if (f.get('messages') === undefined) {
          message = f.get('name');
        }
        if (this.$store.state.feature && f.getProperties().mongoID === this.$store.state.feature.get('mongoID')) {
          const labelSelected = new ol.style.Style({
            text: new ol.style.Text({
              font: 'bold 14px Verdana',
              text: message,
              fill: new ol.style.Fill({
                color: 'red',
              }),
              stroke: new ol.style.Stroke({
                color: 'white',
                width: 3.5,
              }),
              offsetY: -15,
            }),
          });
          f.setStyle([
            styles.selectedPoint,
            styles.selectedLineString,
            styles.selectedPolygon,
            labelSelected,
          ]);
        } else {
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
        }
      });
      // this.messages = [];
      // this.resetSymbologyMenu();
      // this.start = 0;
      // this.end = 25;
      // this.loadConversation(this.loading).then(() => {
      //   console.log('conversation loaded');
      //   this.loading = false;
      // });
    },
    // '$store.state.liveUsersList': function handle() {
    //   console.log('load live geodata');
    //   if (this.$store.state.isUserLoggedIn) {
    //     this.loadLiveGeodata().then(() => {
    //       this.loading = false;
    //     });
    //   }
    // },
    // strokeWidth: function handle() {
    //   console.log('width changed');
    //   this.strokeWidthChange = true;
    //   this.setSymbology();
    // },
    // newFeature: function emit() {
    //   console.log('newpostfeature changed', typeof (this.$store.state.addingToPost));
    //   const geojson = new ol.format.GeoJSON();
    //   if (this.$store.state.addingToPost === undefined) {
    //     const msg = {
    //       userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
    //       feature: geojson.writeFeature(this.$store.state.newpostfeature),
    //     };
    //     console.log('sending feature to followers', msg);
    //     this.$socket.emit('newGeometry', msg);
    //     this.$eventHub.$emit('drawEnd', 'drawEnd');
    //     this.newGeometryDrawn(msg);
    //   } else {
    //     console.log('not undefined');
    //   }
    // },
    '$store.state.openedTimeline': function changed() {
      console.log('opened timeline changed so clear map features:: ', this.$store.state.openedTimeline);
      // this.$store.state.openedTimeline !== this.$store.state.previousOpenedTimeline
      if (this.$store.state.openedTimeline === null) {
        this.$eventHub.$emit('loadTimelineFeatures');
      }
    },
  },
  mounted() {
    olMap.setTarget('mapDiv');
    const container = document.getElementById('popup');
    // const closer = document.getElementById('popup-closer');

    const overlay = new ol.Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
    // closer.onclick = function () {
    //   overlay.setPosition(undefined);
    //   closer.blur();
    //   return false;
    // };
    olMap.addOverlay(overlay);
    olMap.on('singleclick', (evt) => {
      if (this.$store.state.feature) {
        const coordinate = evt.coordinate;
        overlay.setPosition(coordinate);
      } else {
        overlay.setPosition(undefined);
      }
    });

    // this.$options.sockets.userJoinedChat = (data) => {
    //   console.log('user joined::', data);
    //   this.usersChatting.push(data);
    // };
    // this.$options.sockets.newFeatureMessage = (data) => {
    //   this.newFeatureMessage(data);
    // };
    // this.$options.sockets.newGeometry = (data) => {
    //   this.addNewGeometry(data);
    // };
    // this.$options.sockets.setSymbology = (data) => {
    //   console.log('symbology received');
    //   this.setSymbologyFromSocket(data);
    // };
    // this.$eventHub.$on('previousFeatures', () => {
    //   this.featuresStart -= 25;
    //   this.featuresEnd -= 25;
    //   this.loadLiveGeodata();
    // });
    // this.$eventHub.$on('nextFeatures', () => {
    //   this.featuresStart += 25;
    //   this.featuresEnd += 25;
    //   this.loadLiveGeodata();
    // });
  },
};
</script>
<style lang="scss">
  .mapStyle {
    width: auto;
    height: 100%;
    height: 90vh;
  }
  .ol-zoom {
    left: unset;
    right: 8px;
    top: 50px;
    background-color: rgba(255,255,255,0);
    &:hover {
    background-color: rgba(255,255,255,0);
    }
    .ol-zoom-in {
      background-color: rgba(96, 125, 139, .5);
      border-radius: 50%;
    }
    .ol-zoom-out {
      background-color: rgba(96, 125, 139, .5);
      border-radius: 50%;
      top: .5em;
      position: relative;
    }
  }
  .ol-touch .ol-control button {
  font-size: 1.14em;
  }
  .ol-control button {
  font-size: 1.5em;
   &:hover {
     background-color: red;
   }
  }

  .floating-bottom {
    position: absolute;
    left: 35%;
    bottom: 2%;
    width: 200px;
    // background-color: white;
    overflow-y: auto;
  }

  .message-list {
    overflow-y: auto;
    max-height: 150px;
    padding: 0px;
    margin: 0px;
    font-size: 0.55em !important;
  }
  .ol-popup {
    position: absolute;
    // background-color: white;
    // -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    // filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    // padding: 15px;
    // border-radius: 10px;
    // border: 1px solid #cccccc;
    // bottom: 12px;
    left: -50px;
    min-width: 80px;
  }
  .ol-popup:after, .ol-popup:before {
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }
  .ol-popup:after {
    // border-top-color: white;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;
  }
  .ol-popup:before {
    // border-top-color: #cccccc;
    border-width: 11px;
    left: 48px;
    margin-left: -11px;
  }
  .ol-popup-closer {
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
  }
  .ol-popup-closer:after {
    content: "✖";
  }
</style>
