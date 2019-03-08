<template>
  <v-layout row wrap xs12 sm12 md12 v-if="questionnaire">
    <div v-if="page === 0 && questionnaire">
      <v-container fluid row
        v-for="item in questionnaire.properties.introduction.items"
        :key="item.id"
      >
        <h3 v-if="item.type === 'heading'" class="headline mb-0">{{ item.value }}</h3>
        <div v-if="item.type === 'text'" > {{ item.value }} </div>
        <img v-if="item.type === 'image'" :src="item.value" aspect-ratio="2.75"/>
      </v-container>
    </div>

    <v-container pa-1 ma-0 row v-for="question in questionnaire.questions" :key="question.id">

      <v-card v-if="question.page === page">
        <v-card-title primary-title>
          <div>
            <h3 class="headline mb-0">{{ question.title }} <span v-if="question.optional === false">*</span></h3>
            <v-alert color="error" icon="warning" :value="question.error">
              Δεν έχετε απαντήσει στην ερώτηση
            </v-alert>
            <div> {{ question.description }} </div>
          </div>
        </v-card-title>
        <img
          v-if="question.image"
          :src="question.image"
          aspect-ratio="2.75"
        />
        <v-card-text>

        <v-flex v-if="question.type === 'textfield'">
          <v-text-field
            name="input-1"
            v-model="question.value"
            label="Η απάντησή σας"
          ></v-text-field>
        </v-flex>

        <v-flex v-if="question.type === 'combobox'">
          <v-select
            v-bind:items="question.items"
            v-model="question.value"
            label="Η απάντησή σας"
            single-line
            menu-props="bottom"
          ></v-select>
        </v-flex>

        <v-container row wrap v-if="question.type === 'checkboxGroup'">
            <v-flex v-for="checkbox in question.checkboxes" :key="checkbox.id">
              <v-checkbox
                :label="checkbox.label"
                v-model="checkbox.value"
                :value="checkbox.value">
              </v-checkbox>
            </v-flex>
        </v-container>

        <v-container row wrap v-if="question.type === 'radioGroup'">
          <v-radio-group v-model="question.value" mandatory>
            <v-radio
              v-for="radio in question.radios"
              :key="radio.id"
              :label="`${radio.label}`"
              :value="radio.label"
            ></v-radio>
          </v-radio-group>
        </v-container>

        <v-container row wrap v-if="question.type === 'mapPointer'">
          <v-flex v-for="button in question.buttons" :key="button.id">{{ button.label }}
            <v-btn small fab dark class="indigo" @click="getFromMap(button.id, 'Point')">
              <v-icon dark>location_on</v-icon>
            </v-btn>
          </v-flex>
        </v-container>

        <v-container v-if="question.type === 'mapPointerMultiple'">
          <v-layout row wrap v-for="line in question.lines" :key="line.id">
            <v-flex xs10>
              <v-text-field
                name="input-1"
                v-model="line.value"
                label="Η απάντησή σας"
              ></v-text-field>
            </v-flex>
            <v-flex xs2>
              <v-btn small fab dark class="indigo" @click="getFromMap(line.id, 'Point')">
                <v-icon dark>location_on</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
          <v-btn dark class="indigo" @click="addRow(question)">
            Προσθήκη γραμμής
          </v-btn>
        </v-container>

        </v-card-text>
      </v-card>
    </v-container>
    
    <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
    
    <v-btn dark block class="indigo" @click="submit('page');" v-if="page < questionnaire.properties.pages">
      Επόμενη Ενότητα >> <span v-if="page > 0"> &nbsp; {{ page }} / {{ questionnaire.properties.pages }}</span>
    </v-btn>

    <v-btn dark block class="indigo" @click="submit('all')" v-if="page === questionnaire.properties.pages">
      ΥΠΟΒΟΛΗ ΕΡΩΤΗΜΑΤΟΛΟΓΙΟΥ<v-icon dark>send</v-icon>
    </v-btn>

    <v-snackbar
      :timeout=5000
      v-model="snackbarError"
      color= "red"
    >Υπάρχουν σφάλματα. Δείτε τις ερωτήσεις που έχουν σημανθεί με κόκκινο</v-snackbar>

    <v-alert color="success" icon="check_circle" :value="submitted">
      Οι απαντήσεις σας καταχωρίστηκαν επιτυχώς.
    </v-alert>

  </v-layout>
</template>
<script>
import ol from 'openlayers';
import axios from 'axios';
import olMap from '../js/map';
import config from '../config';

export default {
  props: ['id'],
  data() {
    return {
      snackbarError: false,
      submitted: false,
      page: 0,
      loading: false,
      questionnaire: null,
    };
  },
  methods: {
    async validate(questionnaire) {
      let error = false;
      questionnaire.forEach((q) => {
        if (q.error) {
          console.log('there is error in ::: ', q.id);
          const objIndex =
            this.questionnaire.questions.findIndex((obj => obj.id === q.id));
          this.questionnaire.questions[objIndex].error
            = true; // eslint-disable-line no-param-reassign
          error = true;
        } else {
          const objIndex =
            this.questionnaire.questions.findIndex((obj => obj.id === q.id));
          this.questionnaire.questions[objIndex].error
            = false; // eslint-disable-line no-param-reassign
        }
      });
      console.log(!error);
      return !error;
    },
    addRow(question) {
      if (question.lines.length < 21) {
        question.lines.push({ id: `${question.id}${question.lines.length + 1}`, value: null, coords: [] });
      }
      console.log(`added this id:: ${question.id}${question.lines.length + 1}`);
    },
    async getValues() {
      const questionnaireResult = [];
      this.questionnaire.questions.forEach((q) => {
        if (q.page === this.page) {
          if (q.type === 'textfield') {
            if ((q.value && q.value.length > 0) || (q.optional === true)) {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: q.value,
                error: false,
              });
            } else {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: q.value,
                error: true,
              });
            }
          }
          if (q.type === 'combobox') {
            if (q.value !== null || q.optional === true) {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: q.value,
                error: false,
              });
            } else {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: q.value,
                error: true,
              });
            }
          }
          if (q.type === 'checkboxGroup') {
            const boxes = [];
            const errors = [];
            q.checkboxes.forEach((c) => {
              errors.push(c.value);
            });
            q.checkboxes.forEach((c) => {
              boxes.push([c.label, c.value]);
            });
            if (errors.includes(true) || q.optional === true) {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: boxes,
                error: false,
              });
            } else {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: boxes,
                error: true,
              });
            }
          }
          if (q.type === 'radioGroup') {
            if (q.value || q.optional === true) {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: q.value,
                error: false,
              });
            } else {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: q.value,
                error: true,
              });
            }
          }
          if (q.type === 'mapPointer') {
            const coordinates = [];
            const values = [];
            q.buttons.forEach((b) => {
              values.push(b.label);
              const features = this.$store.state.questionnaireFeatures;
              features.forEach((f) => {
                if (f.getProperties().buttonId === b.id) {
                  coordinates.push(f);
                }
              });
            });
            if (coordinates.length === 2 || q.optional === true) {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                coordinates,
                value: values,
                error: false,
              });
            } else {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                coordinates,
                value: values,
                error: true,
              });
            }
          }
          if (q.type === 'mapPointerMultiple') {
            const coordinates = [];
            const values = [];
            q.lines.forEach((b) => {
              console.log('b:: ', b);
              if (b.value) {
                values.push(b.value);
                const features = this.$store.state.questionnaireFeatures;
                features.forEach((f) => {
                  if (f.getProperties().buttonId === b.id) {
                    coordinates.push(f);
                  }
                });
              }
            });
            if ((values.length > 0 && coordinates.length > 0) || q.optional === true) {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: values,
                coordinates: coordinates,
                error: false,
              });
            } else {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: values,
                coordinates: coordinates,
                error: true,
              });
            }
            console.log(q.id, q.title, q.value);
          }
        }
      });
      console.log('result:: ', questionnaireResult);
      return questionnaireResult;
    },
    async getAllValues() {
      const geojsonFormat = new ol.format.GeoJSON();
      const questionnaireResult = [];
      this.questionnaire.questions.forEach((q) => {
        if (q.type === 'textfield') {
          if (q.value && q.value.length > 0) {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: q.value,
              error: false,
              type: q.type,
            });
          } else {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: q.value,
              error: true,
              type: q.type,
            });
          }
        }
        if (q.type === 'combobox') {
          if (q.value !== null) {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: q.value,
              error: false,
              type: q.type,
            });
          } else {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: q.value,
              error: true,
              type: q.type,
            });
          }
        }
        if (q.type === 'checkboxGroup') {
          const boxes = [];
          const errors = [];
          q.checkboxes.forEach((c) => {
            errors.push(c.value);
          });
          q.checkboxes.forEach((c) => {
            boxes.push([c.label, c.value]);
          });
          if (errors.includes(true)) {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: boxes,
              error: false,
              type: q.type,
            });
          } else {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: boxes,
              error: true,
              type: q.type,
            });
          }
        }
        if (q.type === 'radioGroup') {
          if (q.value) {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: q.value,
              error: false,
              type: q.type,
            });
          } else {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: q.value,
              error: true,
              type: q.type,
            });
          }
        }
        if (q.type === 'mapPointer') {
          const coordinates = [];
          const values = [];
          q.buttons.forEach((b) => {
            const features = this.$store.state.questionnaireFeatures;
            values.push(b.label);
            features.forEach((f) => {
              if (f.getProperties().buttonId === b.id) {
                f.setProperties({
                  label: b.label,
                });
                coordinates.push(geojsonFormat.writeFeatures([f]));
              }
            });
          });
          if (coordinates.length === 2 || q.optional === true) {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              coordinates,
              value: values,
              error: false,
              type: q.type,
            });
          } else {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              coordinates,
              value: values,
              error: true,
              type: q.type,
            });
          }
        }
        if (q.type === 'mapPointerMultiple') {
          const coordinates = [];
          const values = [];
          q.lines.forEach((b) => {
            console.log('b:: ', b);
            if (b.value) {
              values.push(b.value);
              const features = this.$store.state.questionnaireFeatures;
              features.forEach((f) => {
                if (f.getProperties().buttonId === b.id) {
                  f.setProperties({
                    label: b.value,
                  });
                  coordinates.push(geojsonFormat.writeFeatures([f]));
                }
              });
            }
          });
          if ((values.length > 0 && coordinates.length > 0) || q.optional === true) {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: values,
              coordinates: coordinates,
              error: false,
              type: q.type,
            });
          } else {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: values,
              coordinates: coordinates,
              error: true,
              type: q.type,
            });
          }
          console.log(q.id, q.title, q.value);
        }
      });
      console.log('result:: ', questionnaireResult);
      return questionnaireResult;
    },
    getFromMap(id, type) {
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach((layer) => {
        if (layer.getProperties().name === 'customLayer') {
          layer.getSource().forEachFeature((feature) => {
            if (feature.get('buttonId') === id) {
              layer.getSource().removeFeature(feature);
            }
          });
        }
      });

      this.$store.commit('setQuestionnaireFeatureId', id);
      olMap.getInteractions().forEach((interaction) => {
        if (interaction instanceof ol.interaction.Draw) {
          if (interaction.getProperties().name === type) {
            interaction.setActive(true);
          } else {
            interaction.setActive(false);
          }
        }
      });
    },
    submit(type) {
      this.getValues().then((res) => {
        this.validate(res).then((v) => {
          if (v) {
            console.log('next page', v);
            this.page += 1;
            if (type === 'all') {
              this.getAllValues().then((result) => {
                console.log('send to server', result, typeof (result));
                const questionnaireToPost = {
                  qid: this.questionnaire._id, // eslint-disable-line no-underscore-dangle
                  results: result,
                  properties: this.questionnaire.properties,
                  submittedOn: Date.now(),
                };
                console.log(questionnaireToPost);
                return questionnaireToPost;
              }).then((questionnaireToPost) => {
                this.sendToServer(questionnaireToPost);
              });
            }
          } else {
            console.log('show the error', v);
            this.snackbarError = true;
          }
        });
      });
    },
    sendToServer(questionnaire) {
      console.log('send this to server:: ', questionnaire);
      const url = `${config.url}/public/submitQuestionnaire`;
      const questionnaireToPost = questionnaire;
      axios.post(url, { questionnaireToPost }).then((response) => {
        if (response.status === 200) {
          this.submitted = true;
          this.$store.commit('resetQuestionnaire');
        }
      }).catch(console.error);
    },
    zoomToExtent() {
      const g = this.questionnaire.properties.mapExtent;
      olMap.getView().fit(g, olMap.getSize());
    },
    loadQuestionnaire() {
      const serverUrl = `${config.url}/public/questionnaires`;
      axios.get(serverUrl, { params: {
        questionnaireId: this.id,
      },
      }).then((response) => {
        this.questionnaire = response.data[0];
        this.$store.commit('setQuestionnaire', response.data[0]);
      }).then(() => {
        this.loading = false;
        this.zoomToExtent();
      });
    },
  },
  mounted() {
    console.log('mounted questionnaire');
    this.$store.commit('setQuestionnaireMode', true);
    this.loadQuestionnaire();
  },
};
</script>
