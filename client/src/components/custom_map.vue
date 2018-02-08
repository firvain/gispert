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
            <v-btn class="green white--text darken-1" @click="shareMapDialog = true">Μοιρασου αυτο χαρτη</v-btn>
          </v-card-actions>
        </v-card-actions>
      </v-card>
    </v-flex>


    <v-dialog v-model="shareMapDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Μοιράσου το χάρτη</v-card-title>
        <v-card-text>
          <v-text-field
            label="Σύνδεσμος"
            v-model="shareMapUrl"
            single-line
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
        <v-btn
          dark
          class="cyan"
          @click="shareMap">
          {{shareText}}
        </v-btn>
          <v-btn color="green darken-1" flat="flat" @click.native="shareMapDialog = false">Άκυρο</v-btn>
        </v-card-actions>
      </v-card>
      <v-snackbar
        :timeout=5000
        v-model="snackbarShareMap"
        color='red'
      >Το μοίρασες
      </v-snackbar>
    </v-dialog>


  </v-layout>
</template>
<script>
import ol from 'openlayers';
import axios from 'axios';
import config from '../config';

// import turf from 'turf';
import olMap from '../js/map';
// import styles from '../js/styles';

export default {
  props: ['customMap'],
  name: 'customMap',
  data: () => ({
    shareMapDialog: false,
    snackbarShareMap: false,
    shareText: 'Μοιράσου',
  }),
  methods: {
    explore(mid) {
      // this.$emit('explore', this.customMap); TODO send this on user profile!
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/filelayers/id`;
      axios.get(url, {
        params: { id: mid },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        const features = new ol.format.GeoJSON().readFeatures(response.data, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        });
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
            const extent = ol.extent.createEmpty();
            features.forEach((f) => {
              ol.extent.extend(extent, f.getGeometry().getExtent());
            });
            // console.log(extent);
            if (extent[0] - extent[2] < 500) {
              extent[0] -= 400;
              extent[2] += 400;
            }
            if (extent[1] - extent[3] < 500) {
              extent[1] -= 400;
              extent[3] += 400;
            }
            olMap.getView().fit(extent, olMap.getSize());
          }
        });
      });
    },
    loadRouterMap() {
      const id = this.$route.params.id;
      if (id) {
        this.explore(id);
      }
    },
    shareMap() {

    },
  },
  computed: {
    shareMapUrl() {
      const url = `${window.location.href}/${this.customMap.id}`;
      // console.log(this.customMap.id);
      return url;
    },
  },
  watch: {
    $route: 'loadRouterMap',
  },
  mounted() {
    const id = this.$route.params.id;
    if (id) {
      this.explore(id);
    }
  },
};
</script>
