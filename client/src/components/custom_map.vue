https://calm-gorge-20681.herokuapp.com/api/fileLayers/id?id=58807c5684ec7433f1f2efd51484824159003
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
import olMap from '../js/map';
import styles from '../js/styles';

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
        const geojsonFormat = new ol.format.GeoJSON();
        const features = new ol.format.GeoJSON().readFeatures(response.data, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        });
        let allLayers = [];
        allLayers = olMap.getLayers().getArray();
        allLayers.forEach((layer) => {
          if (layer.getProperties().name === 'customLayer') {
            const AddedFeature = geojsonFormat.readFeatures(features);
            let alreadyExists = false;
            layer.getSource().forEachFeature((feature) => {
              // console.log(AddedFeature);
              if (feature.get('mongoID') === AddedFeature[0].getProperties().mongoID) {
                alreadyExists = true;
              }
            });
            const g = AddedFeature[0].getGeometry().getExtent();
            if (alreadyExists === false) {
              layer.getSource().addFeatures(AddedFeature);
            }
            if (g[0] - g[2] < 500) {
              g[0] -= 400;
              g[2] += 400;
            }
            if (g[1] - g[3] < 500) {
              g[1] -= 400;
              g[3] += 400;
            }
            olMap.getView().fit(g, olMap.getSize());
            const cs = AddedFeature[0].getStyle();

            AddedFeature[0].setStyle(styles.BoldLineString);

            setTimeout(() => {
              AddedFeature[0].setStyle(cs);
              olMap.updateSize();
            }, 500);
          }
        });
      })
      .catch((e) => {
        console.log(e);
      });
      // console.log(response);
    },
  },
  computed: {
  },
};
</script>
