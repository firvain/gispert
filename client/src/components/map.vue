<template>
  <div id='mw' class="mapStyle">
    <div id='mapDiv' class="mapStyle"></div>
    <div id="popup" class="ol-popup">
      <div id="popup-content">
        <mapTools></mapTools>
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

    const overlay = new ol.Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
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
  },
};
</script>
<style lang="scss">
  .mapStyle {
    width: auto;
    height: 100%;
    height: 89vh;
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
