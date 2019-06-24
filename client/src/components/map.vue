<template>
  <div id='mw' class="mapStyle">
    <div id="overlayLock" :class='$store.state.mapState' v-if="$store.state.questionnaireMode === 'answering'"></div> 
    <div id='mapDiv' class="mapStyle"></div>
    <div id="popup" class="ol-popup">
      <div id="popup-content">
        <mapTools></mapTools>
      </div>
    </div>
    <div id="messagesPopup" class="ol-popup-drawMessage">
      <div id="message-popup-content">
      </div>
    </div>
    <v-container xs3 md3 class="floating-bottom">
      <v-btn @click="setBasemap('bing')">Aerial</v-btn>
      <v-btn @click="setBasemap('esri')">Road</v-btn>
    </v-container>
  </div>
</template>
<script>
import ol from 'openlayers';
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
    mapTools, olMap,
  },
  computed: {
    messageDraw() {
      return this.$store.state.drawMessage;
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
    },
    '$store.state.openedTimeline': function changed() {
      console.log('opened timeline changed so clear map features:: ', this.$store.state.openedTimeline);
      // this.$store.state.openedTimeline !== this.$store.state.previousOpenedTimeline
      if (this.$store.state.openedTimeline === null) {
        this.$eventHub.$emit('loadTimelineFeatures');
      }
    },
  },
  mounted() {
    olMap.setTarget(document.getElementById('mapDiv'));
    console.log(olMap);
    const container = document.getElementById('popup');
    // const closer = document.getElementById('popup-closer');

    document.addEventListener('keydown', (e) => {
      if (e.which === 46) {
        console.log('delete pressed');
        olMap.getInteractions().forEach((interaction) => {
          console.log(interaction.getProperties());
          if (interaction instanceof ol.interaction.Draw && interaction.getProperties().name === 'LineString') {
            console.log('found line');
            interaction.removeLastPoint();
          }
        });
      }
    });

    const overlay = new ol.Overlay({
      id: 'popupOverlay',
      element: container,
      // autoPan: true,
      // autoPanAnimation: {
      //   duration: 250,
      // },
    });
    olMap.addOverlay(overlay);
    olMap.on('singleclick', (evt) => {
      if (this.$store.state.feature) {
        const coordinate = evt.coordinate;
        overlay.setPosition([coordinate[0] + 5, coordinate[1] - 10]);
      } else {
        overlay.setPosition(undefined);
      }
    });

    const messagesOverlay = new ol.Overlay({
      id: 'messagesOverlay',
      element: document.getElementById('messagesPopup'),
    });
    olMap.addOverlay(messagesOverlay);
    olMap.on('pointermove', (e) => {
      document.getElementById('message-popup-content').innerHTML = `${this.messageDraw}`;
      const zoomLevel = olMap.getView().getZoom();
      if (zoomLevel >= 18) {
        messagesOverlay.setPosition([e.coordinate[0] + 10, e.coordinate[1] + 20]);
      }
      if (zoomLevel >= 16 && zoomLevel < 18) {
        messagesOverlay.setPosition([e.coordinate[0] + 20, e.coordinate[1] + 30]);
      }
      if (zoomLevel >= 15 && zoomLevel < 16) {
        messagesOverlay.setPosition([e.coordinate[0] + 40, e.coordinate[1] + 60]);
      }
      if (zoomLevel >= 13 && zoomLevel < 15) {
        messagesOverlay.setPosition([e.coordinate[0] + 80, e.coordinate[1] + 120]);
      }
      if (zoomLevel >= 11 && zoomLevel < 13) {
        messagesOverlay.setPosition([e.coordinate[0] + 320, e.coordinate[1] + 480]);
      }
      if (zoomLevel >= 9 && zoomLevel < 11) {
        messagesOverlay.setPosition([e.coordinate[0] + 1500, e.coordinate[1] + 3000]);
      }
      if (zoomLevel >= 7 && zoomLevel < 9) {
        messagesOverlay.setPosition([e.coordinate[0] + 5000, e.coordinate[1] + 8000]);
      }
      if (zoomLevel >= 5 && zoomLevel < 7) {
        messagesOverlay.setPosition([e.coordinate[0] + 25000, e.coordinate[1] + 40000]);
      }
      if (zoomLevel >= 0 && zoomLevel < 5) {
        messagesOverlay.setPosition([e.coordinate[0] + 80000, e.coordinate[1] + 180000]);
      }
    });
  },
};
</script>
<style lang="scss">
  .mapStyle {
    width: auto;
    height: 87vh;
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
    left: 50%;
    bottom: 5%;
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
    background-color: white;
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
  .ol-popup-drawMessage {
    border-width: 11px;
  }

.mapLocked {
  position: fixed; /* Sit on top of the page content */
  width: 50%; /* Full width (cover the whole page) */
  height: 100%; /* Full height (cover the whole page) */
  top: 0;
  // left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.8); /* Black background with opacity */
  z-index: 2; /* Specify a stack order in case you're using a different order for other elements */
  cursor: pointer; /* Add a pointer on hover */
}
.mapAvailable {
  display: none;
}
</style>
