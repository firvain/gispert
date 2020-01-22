<template>
  <v-container>
    <v-layout row wrap>
      <v-progress-linear
        v-show="loading"
        :indeterminate="true"
      ></v-progress-linear>
      <v-flex v-if="questionnaireResults" xs12 sm12 md12>
        <v-container
          v-for="question in questionnaireResults.results"
          :key="question.id"
          pa-1
          ma-0
          row
        >
          <v-card>
            <v-card-title primary-title>
              <div>
                <h3 class="headline mb-0">{{ question.title }}</h3>
              </div>
            </v-card-title>
            <v-card-text>
              <v-flex
                v-if="
                  question.type === 'textfield' ||
                    question.type === 'textfieldvalidation'
                "
              >
                {{ question.value }}
                <span v-if="question.value === null">
                  {{ $t("message.noValue") }}
                </span>
              </v-flex>

              <v-flex v-if="question.type === 'combobox'"
                >{{ question.text }}
                {{ question.value }}
              </v-flex>

              <v-flex v-if="question.type === 'radioGroup'">
                {{ question.value }}
              </v-flex>

              <v-flex v-if="question.type === 'checkboxGroup'"
                >{{ question.text }}
                <v-flex v-for="checkbox in question.value" :key="checkbox[0]">
                  <v-checkbox
                    v-model="checkbox[1]"
                    :label="checkbox[0]"
                    :value="checkbox[1]"
                    disabled
                  >
                  </v-checkbox>
                </v-flex>
              </v-flex>

              <v-flex v-if="question.type === 'preferenceHierarchy'" row wrap>
                <v-list one-line>
                  <template v-for="element in question.value">
                    <v-list-tile :key="element.id" avatar class="force-hover">
                      <v-list-tile-content>
                        <v-list-tile-title
                          v-html="element.label"
                        ></v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </template>
                </v-list>
              </v-flex>

              <v-flex v-if="question.type === 'mapPointer'">
                <v-list two-line>
                  <template v-for="(item, index) in question.value">
                    <v-list-tile
                      :key="index"
                      @click="loadFeature(question.coordinates[index], item)"
                    >
                      <v-list-tile-content>
                        <v-list-tile-title v-html="item"></v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </template>
                </v-list>
              </v-flex>

              <v-flex v-if="question.type === 'mapLineString'">
                <v-list two-line>
                  <template v-for="(item, index) in question.value">
                    {{ question.type }}
                    <v-list-tile
                      :key="index"
                      @click="loadFeature(question.coordinates[index], item)"
                    >
                      <v-list-tile-content>
                        <v-list-tile-title v-html="item"></v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </template>
                </v-list>
              </v-flex>

              <v-flex v-if="question.type === 'mapPointerMultiple'">
                <v-list one-line>
                  <template v-for="(item, index) in question.value">
                    <v-list-tile
                      :key="index"
                      @click="loadFeature(question.coordinates[index], item)"
                    >
                      <v-list-tile-content>
                        <v-list-tile-title v-html="item"></v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </template>
                </v-list>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-container>
      </v-flex>
      <div v-if="questionnaireResults" class="body-1">
        {{ $t("message.submitted") }}:
        {{
          moment(parseInt(questionnaireResults.submittedOn)).format(
            "h:mm:ss a, DD-MM-YYYY"
          )
        }}
      </div>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";
import ol from "openlayers";
import olMap from "../js/map";
import config from "../config";

export default {
  name: "QuestionnaireResultsViewer",
  components: {},
  props: ["id"],
  data() {
    return {
      search: "",
      exportDataDialog: false,
      exportGeoDataDialog: false,
      questionnaireResults: null,
      activeTab: null,
      loading: false
    };
  },
  mounted() {
    this.loadQuestionnaireResults();
  },
  methods: {
    loadQuestionnaireResults() {
      const serverUrl = `${config.url}/questionnaires/questionnaireResult`;
      axios
        .get(serverUrl, {
          params: {
            userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
            questionnaireId: this.id
          },
          headers: { "x-access-token": this.$store.state.token }
        })
        .then(response => {
          this.questionnaireResults = response.data[0];
        })
        .then(() => {
          this.loading = false;
        });
    },
    loadFeature(featureToLoad, text) {
      console.log("load feature::", featureToLoad);
      const geojsonFormat = new ol.format.GeoJSON();
      // console.log('adding a post feature data:: ', text);
      const featuresToLoad = geojsonFormat.readFeatures(featureToLoad);
      if (featuresToLoad.length > 0) {
        let allLayers = [];
        allLayers = olMap.getLayers().getArray();
        allLayers.forEach(layer => {
          if (layer.getProperties().name === "customLayer") {
            featuresToLoad.forEach(f => {
              let alreadyExists = false;
              layer.getSource().forEachFeature(feature => {
                if (feature.get("buttonId") === f.getProperties().buttonId) {
                  alreadyExists = true;
                }
              });
              if (!alreadyExists) {
                let message = "";
                if (text.length > 20) {
                  message = `${text.substr(0, 20)}...`;
                } else {
                  message = text;
                }
                f.setProperties({
                  messages: message
                });
                console.log(featuresToLoad);
                layer.getSource().addFeature(featuresToLoad[0]);
              }
            });
          }
          const g = featuresToLoad[0].getGeometry().getExtent();
          if (g[0] - g[2] < 500) {
            g[0] -= 100;
            g[2] += 100;
          }
          if (g[1] - g[3] < 500) {
            g[1] -= 100;
            g[3] += 100;
          }
          olMap.getView().fit(g, olMap.getSize());
        });
      }
    }
  }
};
</script>
