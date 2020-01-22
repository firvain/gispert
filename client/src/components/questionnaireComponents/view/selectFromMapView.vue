<template>
  <v-container v-if="question.type === 'mapSelector'" row wrap>
    <v-flex v-for="button in question.buttons" :key="button.id">
      <v-btn
        small
        fab
        dark
        :color="button.style.strkClr"
        @click="getFromMap(button.id)"
      >
        <v-icon dark>all_out</v-icon>
      </v-btn>
    </v-flex>
  </v-container>
</template>
<script>
import ol from "openlayers";
import olMap from "../../../js/map";

export default {
  name: "MapSelector",
  props: ["question"],
  watch: {
    "$store.state.feature": function change(e) {
      if (
        this.question.buttons &&
        this.question.buttons[0].id === this.$store.state.questionnaireFeatureId
      ) {
        this.question.value = e.getProperties().id;
      }
    }
  },
  mounted() {},
  methods: {
    getFromMap(id) {
      this.loadFeatures();
      this.$store.commit("setMapState", "mapAvailable");
      olMap.setActiveInteraction("select");
      this.$store.commit("setQuestionnaireFeatureId", id);
    },
    loadFeatures() {
      if (this.question.mapDataToSelectFrom) {
        const geojsonFormat = new ol.format.GeoJSON();
        const featuresToLoad = geojsonFormat.readFeatures(
          this.question.mapDataToSelectFrom,
          {
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857"
          }
        );
        const allLayers = olMap.getLayers().getArray();
        let customlayersource;
        allLayers.forEach(layer => {
          if (layer.getProperties().name === "customLayer") {
            customlayersource = layer.getSource();
            layer.getSource().clear();
          }
        });
        featuresToLoad.forEach(f => {
          customlayersource.addFeature(f);
          // const g = f.getGeometry().getExtent();
          // olMap.getView().fit(g, olMap.getSize());
        });
      }
    }
  }
};
</script>
