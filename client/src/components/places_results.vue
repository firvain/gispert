<template>
  <v-layout>
    <v-flex>
      <v-card class="overflowing">
        {{ results.display_name }}
        <v-list two-line subheader>
          <v-list-tile v-for="item in results" :key="item.display_name" avatar>
            <!-- <v-list-tile-avatar>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-avatar> -->
            <v-list-tile-content>
              <v-list-tile-title>{{ item.address.city }}</v-list-tile-title>
              <v-list-tile-sub-title>{{
                item.display_name
              }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon ripple @click="addPlaceToMap(item)">
                <v-icon color="grey lighten-1">location_on</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import ol from "openlayers";
import olMap from "../js/map";
// import styles from '../js/styles';

export default {
  props: ["results"],
  methods: {
    addPlaceToMap(item) {
      // feature.getGeometry().transform(src, dest)
      // const point = ol.proj.transform([item.lat, item.lon], 'EPSG:4326', 'EPSG:3857');
      const point = [item.lat, item.lon];
      console.log(point, item.lat, item.lon);
      const feature = new ol.Feature({
        geometry: new ol.geom.Point(point).transform("EPSG:4326", "EPSG:3857"),
        // labelPoint: new ol.geom.Point([item.lon, item.lat]),
        name: item.display_name
      });
      console.log(feature.getGeometry().getCoordinates());
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach(layer => {
        if (layer.getProperties().name === "customLayer") {
          console.log("adding feature");
          layer.getSource().addFeature(feature);
        }
      });
    }
  }
};
</script>
<style>
.overflowing {
  word-wrap: break-word;
  font-size: 2em;
  padding: 2px;
  margin: 2px;
  position: absolute;
  left: 50%;
  top: 60px;
  width: 50%;
  overflow-y: auto;
  z-index: 9999999;

  /*
  position: relative;
  right: 10px; */
  /* width: 100px; */
}
</style>
