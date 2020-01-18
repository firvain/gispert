<template>
  <v-container row wrap v-if="question.type === 'mapSelector'">
    <v-flex v-for="button in question.buttons" :key="button.id">{{ button.label }}
      <v-btn small fab dark :color="button.style.strkClr" @click="getFromMap()">
        <v-icon dark>all_out</v-icon>
      </v-btn>
    </v-flex>
  </v-container>
</template>
<script>
import ol from 'openlayers';
import olMap from '../../../js/map';

export default {
  name: 'mapSelector',
  props: ['question'],
  watch: {
    '$store.state.feature': function change(e) {
      this.changeQuestionCoords(e.getProperties().id);
    },
  },
  methods: {
    getFromMap() {
      this.loadFeatures();
      this.$store.commit('setMapState', 'mapAvailable');
      olMap.setActiveInteraction('select');
    },
    changeQuestionCoords(c) {
      this.question.value = c;
      this.$store.commit('setMapState', 'mapLocked');
      console.log(this.question);
    },
    loadFeatures() {
      if (this.question.mapDataToSelectFrom) {
        // console.log('json string of coords:: ', this.question.mapDataToSelectFrom);
        const geojsonFormat = new ol.format.GeoJSON();
        const featuresToLoad =
        geojsonFormat.readFeatures(this.question.mapDataToSelectFrom, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        });
        const allLayers = olMap.getLayers().getArray();
        let customlayersource;
        allLayers.forEach((layer) => {
          if (layer.getProperties().name === 'customLayer') {
            customlayersource = layer.getSource();
            layer.getSource().clear();
          }
        });
        featuresToLoad.forEach((f) => {
          // console.log('adding feature to map:: ', f);
          customlayersource.addFeature(f);
          const g = f.getGeometry().getExtent();
          olMap.getView().fit(g, olMap.getSize());
        });
      }
    },
  },
  mounted() {
  },
};
</script>