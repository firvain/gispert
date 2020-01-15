<template>
  <v-container row wrap v-if="question.type === 'mapSelector'">
    <v-flex v-for="button in question.buttons" :key="button.id">{{ button.label }}
      <v-btn small fab dark :color="button.style.strkClr" @click="getFromMap()">
        <v-icon dark>all_out</v-icon>
      </v-btn>
    </v-flex>{{ $store.state.feature }}
  </v-container>
</template>
<script>
import ol from 'openlayers';
import olMap from '../../../js/map';

export default {
  name: 'mapSelector',
  props: ['question'],
  methods: {
    getFromMap() {
      this.$store.commit('setMapState', 'mapAvailable');
      olMap.setActiveInteraction('select');
    },
  },
  mounted() {
    if (this.question.mapDataToSelectFrom) {
      console.log('json string of coords:: ', this.question.mapDataToSelectFrom);
      const geojsonFormat = new ol.format.GeoJSON();
      const featuresToLoad =
      geojsonFormat.readFeatures(this.question.mapDataToSelectFrom);
      console.log('features to load:: ', featuresToLoad);
    //   const g = featuresToLoad[0].getGeometry().getExtent();
    //   if (g[0] - g[2] < 500) {
    //     g[0] -= 200;
    //     g[2] += 200;
    //   }
    //   if (g[1] - g[3] < 500) {
    //     g[1] -= 200;
    //     g[3] += 200;
    //   }
    //   olMap.getView().fit(g, olMap.getSize());
      const allLayers = olMap.getLayers().getArray();
      let customlayersource;
      allLayers.forEach((layer) => {
        if (layer.getProperties().name === 'customLayer') {
          customlayersource = layer.getSource();
        }
      });
      featuresToLoad.forEach((f) => {
        console.log('adding feature to map:: ', f);
        customlayersource.addFeature(f);
        // const g = f.getGeometry().getExtent();
        // olMap.getView().fit(g, olMap.getSize());
        console.log(customlayersource.getFeatures());
      });
    }
  },
};
</script>