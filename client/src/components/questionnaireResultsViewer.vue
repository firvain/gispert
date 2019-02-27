<template>
  <v-container>
    <v-tabs dark grow icons centered v-model="activeTab">
      <v-tabs-bar class="blue-grey">
        <v-tabs-slider color="red"></v-tabs-slider>
        <v-tabs-item href="#list" active-class="blue-grey lighten" class="blue-grey lighten-3" ripple>
          <v-icon>list</v-icon>
          <b>Λίστα απαντήσεων</b>
        </v-tabs-item>
        <v-tabs-item href="#aggregates" active-class="blue-grey lighten" class="blue-grey lighten-3" ripple>
          <v-icon>bar_chart</v-icon>
          <b>Συγκεντρωτικά</b>
        </v-tabs-item>
      </v-tabs-bar>
      <v-tabs-items>
        <v-tabs-content
          id="list"
        >
          <v-flex>
            <v-select
              v-bind:items="comboitems"
              item-text="text"
              v-model="activeQuestionnaire"
              label="Όλες οι απαντήσεις"
              single-line
              bottom
              v-on:input="loadResultsForQuestionnaire"
            ></v-select>
          </v-flex>

          <v-flex v-if="activeQuestionnaireResults">
            <v-container pa-0 ma-0 row v-for="question in activeQuestionnaireResults.results" :key="question.id">
              <v-card>
                <v-card-title primary-title>
                  <div>
                    <h3 class="headline mb-0">{{ question.title }}</h3>
                  </div>
                </v-card-title>
                <v-card-text>

                <v-flex v-if="question.type === 'textfield'">
                  {{ question.value }}
                  <span v-if="question.value === null"> Δεν υπάρχει τιμή </span>
                </v-flex>

                <v-flex v-if="question.type === 'combobox'">{{ question.text }}
                  {{ question.value }}
                </v-flex>

                <v-flex v-if="question.type === 'radioGroup'">
                  {{ question.value }}
                </v-flex>

                <v-flex v-if="question.type === 'checkboxGroup'">{{ question.text }}
                  <v-flex v-for="checkbox in question.value" :key="checkbox[0]">
                    <v-checkbox
                      :label="checkbox[0]"
                      :value="checkbox[1]"
                      v-model="checkbox[1]"
                      disabled
                      >
                    </v-checkbox>
                  </v-flex>
                </v-flex>

                <v-flex v-if="question.type === 'mapPointer'">
                  <v-list two-line>
                    <template v-for="(item, index) in question.value">
                      <v-list-tile :key="index" @click="loadFeature(question.coordinates[index], item)">
                        <v-list-tile-content>
                          <v-list-tile-title v-html="item"></v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </template>
                  </v-list>
                </v-flex>

                <v-flex v-if="question.type === 'mapPointerMultiple'">
                  <v-list two-line>
                    <template v-for="(item, index) in question.value">
                      <v-list-tile :key="index" @click="loadFeature(question.coordinates[index], item)">
                        <v-list-tile-content>
                          <v-list-tile-title v-html="item"></v-list-tile-title>
                          <v-list-tile-sub-title v-html="item"></v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </template>
                  </v-list>
                </v-flex>

                </v-card-text>
              </v-card>
            </v-container>
          </v-flex>

        </v-tabs-content>
        <v-tabs-content
          id="aggregates"
        >
          
        </v-tabs-content>
      </v-tabs-items>
    </v-tabs>
    <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
    <!-- <line-chart
      v-if="loaded"
      :chartdata="chartdata"
      :options="options"/> -->
  </v-container>
</template>

<script>
import axios from 'axios';
import ol from 'openlayers';
import olMap from '../js/map';
import config from '../config';

export default {
  name: 'questionnaireResultsViewer',
  props: ['id'],
  data() {
    return {
      questionnaireResults: null,
      activeTab: null,
      loading: false,
      activeQuestionnaire: 1,
      comboitems: [],
      activeQuestionnaireResults: null,
    };
  },
  methods: {
    loadQuestionnaireResults() {
      const serverUrl = `${config.url}/public/questionnaireResults`;
      axios.get(serverUrl, { params: {
        questionnaireId: this.id,
      },
      }).then((response) => {
        this.questionnaireResults = response.data;
        this.getcomboitems();
      }).then(() => {
        this.loading = false;
      });
    },
    getcomboitems() {
      this.questionnaireResults.forEach((r) => {
        this.comboitems.push(
          { id: r._id, text: r.results[0].value }); // eslint-disable-line no-underscore-dangle
      });
      console.log(this.comboitems);
    },
    loadResultsForQuestionnaire() {
      console.log('loading::', this.activeQuestionnaire);
      this.activeQuestionnaireResults = this.questionnaireResults.filter(r =>
        r._id.indexOf( // eslint-disable-line no-underscore-dangle
          this.activeQuestionnaire.id) > -1, // eslint-disable-line no-underscore-dangle
      )[0];
    },
    loadFeature(featureToLoad, text) {
      console.log('load feature::', featureToLoad);
      const geojsonFormat = new ol.format.GeoJSON();
      console.log('adding a post feature data:: ', text);
      const featuresToLoad = geojsonFormat.readFeatures(featureToLoad);
      if (featuresToLoad.length > 0) {
        let allLayers = [];
        allLayers = olMap.getLayers().getArray();
        allLayers.forEach((layer) => {
          if (layer.getProperties().name === 'customLayer') {
            featuresToLoad.forEach((f) => {
              let alreadyExists = false;
              layer.getSource().forEachFeature((feature) => {
                if (feature.get('buttonId') === f.getProperties().buttonId) {
                  alreadyExists = true;
                }
              });
              if (!alreadyExists) {
                let message = '';
                if (text.length > 20) {
                  message = `${text.substr(0, 20)}...`;
                } else {
                  message = text;
                }
                f.setProperties({
                  messages: message,
                });
                console.log(featuresToLoad);
                layer.getSource().addFeature(featuresToLoad[0]);
              }
            });
          }
          const g = featuresToLoad[0].getGeometry().getExtent();
          if (g[0] - g[2] < 500) {
            g[0] -= 200;
            g[2] += 200;
          }
          if (g[1] - g[3] < 500) {
            g[1] -= 200;
            g[3] += 200;
          }
          olMap.getView().fit(g, olMap.getSize());
        });
      }
    },
  },
  mounted() {
    this.loadQuestionnaireResults();
  },
};
</script>
