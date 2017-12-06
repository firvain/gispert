<template>
  <v-layout>
    <v-flex xs12 sm12>
      <v-card>
        <v-card-title primary-title>
          <div>
              <p class="text-xs-left" md12 v-if="customMap.name"><b>{{customMap.name}}</b></p>
              <p class="text-xs-left">{{customMap.description}}</p>
              <p class="text-xs-left">Δημιουργήθηκε από: <b>@{{customMap.user}}</b></p>
          </div>
        </v-card-title>
        <v-card-actions class="white">
          <v-spacer></v-spacer>
          <v-card-actions>
            <v-btn class="green white--text darken-1" @click="explore(customMap.id)">Ανοιξε αυτο χαρτη</v-btn>
          </v-card-actions>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import ol from 'openlayers';
import axios from 'axios';
import turf from 'turf';
import olMap from '../js/map';
// import styles from '../js/styles';

export default {
  props: ['customMap'],
  name: 'customMap',
  data: () => ({
  }),
  methods: {
    explore(id) {
      // this.$emit('explore', this.customMap); TODO send this on user profile!
      axios.get(`http://localhost:8081/v1/fileLayers/id?id=${id}`)
      .then((response) => {
        const features = new ol.format.GeoJSON().readFeatures(response.data, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        });
        const ptj1 = new ol.format.GeoJSON().writeFeatureObject(features[0]);
        const ptj2 = new ol.format.GeoJSON().writeFeatureObject(features[1]);
        // const pt = JSON.parse(ptj);
        // console.log(turf.multiPolygon([[[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]]]));
        const turfFeatures = turf.union(ptj1, ptj2);
        console.log(turfFeatures);
        // console.log(features);
        let allLayers = [];
        allLayers = olMap.getLayers().getArray();
        // console.log(allLayers);
        allLayers.forEach((layer) => {
          if (layer.getProperties().name === 'customLayer') {
            if (layer.getSource().getFeatures().length > 0) {
              features.forEach((f) => {
                let alreadyExists = false;
                layer.getSource().forEachFeature((feature) => {
                  if (feature.get('mongoID') === f.get('mongoID')) {
                    alreadyExists = true;
                  }
                });
                if (alreadyExists === false) {
                  layer.getSource().addFeature(f);
                }
              });
            }
            if (layer.getSource().getFeatures().length === 0) {
              layer.getSource().addFeatures(features);
            }

            // if (g[0] - g[2] < 500) {
            //   g[0] -= 400;
            //   g[2] += 400;
            // }
            // if (g[1] - g[3] < 500) {
            //   g[1] -= 400;
            //   g[3] += 400;
            // }
            // olMap.getView().fit(g, olMap.getSize());
          }
        });
      });
    },
  },
  computed: {
  },
};
</script>
