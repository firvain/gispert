<template>
    <v-layout row wrap xs12 sm12 md12 v-if="questionnaire">
      <h1>Δημιουργία ερωτηματολογίου</h1>
      <v-flex>
        <v-flex v-if="questionnaire.properties.introduction.items.length > 0">
          <v-flex fluid row
            v-for="item in questionnaire.properties.introduction.items"
            :key="item.id"
          >
            <v-text-field
              v-if="item.type === 'heading'"
              name="input-1"
              v-model="item.value"
              label="Δώστε ένα τίτλο για το ερωτηματολόγιο"
            ></v-text-field>
            <v-text-field
              v-if="item.type === 'text'"
              name="input-1"
              v-model="item.value"
              label="Δώστε περισσότερες πληροφορίες για το ερωτηματολόγιο"
            ></v-text-field>
            <img v-if="item.type === 'image'" :src="item.value" aspect-ratio="2.75"/>

            <!-- <v-checkbox
              v-if="item.type === 'loginRequired'"
              label="Να απαιτείται η εγγραφή του χρήστη"
              v-model="questionnaire.properties.loginRequired">
            </v-checkbox> -->
          </v-flex>
        </v-flex>
        Βάλτε περιοχή αναφοράς του ερωτηματολογίου
        <v-btn small fab dark class="indigo" @click="getFromMap('qExtent', 'Box')">
          <v-icon dark>location_on</v-icon>
        </v-btn>

        <v-container pa-1 ma-0 row v-for="question in questionnaire.questions" :key="question.id">
          <v-card>
            <v-layout row wrap>
              <v-flex xs12 pa-1>
                <v-card>
                  <v-card-title primary-title>
                    <div>
                      <div><h4>Προεπισκόπηση ερώτησης</h4></div>
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
                        disabled
                      ></v-text-field>
                    </v-flex>
                    <v-flex v-if="question.type === 'combobox'">
                      <v-select
                        v-bind:items="question.items"
                        item-value="id"
                        item-text="value"
                        label="Η απάντησή σας"
                        single-line
                        menu-props="bottom"
                      ></v-select>
                    </v-flex>
                    <v-container row wrap v-if="question.type === 'checkboxGroup'">
                        <v-flex v-for="checkbox in question.checkboxes" :key="checkbox.id">
                          <v-checkbox
                            :label="checkbox.label">
                          </v-checkbox>
                        </v-flex>
                    </v-container>
                    <v-container row wrap v-if="question.type === 'radioGroup'">
                      <v-radio-group v-model="question.value" mandatory>
                        <v-radio
                          v-for="radio in question.radios"
                          :key="radio.id"
                          :label="`${radio.label}`"
                        ></v-radio>
                      </v-radio-group>
                    </v-container>
                    <v-container row wrap v-if="question.type === 'mapPointer'">
                      <v-flex v-for="button in question.buttons" :key="button.id">{{ button.label }}
                        <v-btn small fab dark class="indigo">
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
                          <v-btn small fab dark class="indigo">
                            <v-icon dark>location_on</v-icon>
                          </v-btn>
                        </v-flex>
                      </v-layout>
                      <v-btn dark class="indigo">
                        Προσθήκη γραμμής
                      </v-btn>
                    </v-container>
                    <v-flex v-if="question.type === 'titleDescription'">
                      <h3 class="headline mb-0">{{ question.title }}</h3>
                      <div> {{ question.description }} </div>
                    </v-flex>

                    <v-layout row wrap align-center>
                      <v-flex xs4>
                        <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="!question.editing">
                          <v-icon>edit</v-icon>
                        </v-btn>
                        <v-btn flat outline fab small @click="reorderQuestions(question, 'up');">
                          <v-icon>keyboard_arrow_up</v-icon>
                        </v-btn>
                        <v-btn flat outline fab small @click="reorderQuestions(question, 'down');">
                          <v-icon>keyboard_arrow_down</v-icon>
                        </v-btn>
                      </v-flex>
                      <v-flex xs4>
                        <v-checkbox
                          v-model="question.pageBreak"
                          @change="pageBreakChangeControl"
                          label="Αλλαγή ενότητας">
                        </v-checkbox>
                      </v-flex>
                      <v-flex>
                        <h5>Ενότητα: {{ question.page + 1 }}</h5>
                      </v-flex>
                  </v-layout>

                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex pa-1 v-if="question.editing">
                <v-card>
                  <v-card-title primary-title>
                    <div>
                      <div><h4>Επιλογές ερώτησης</h4></div>
                    </div>
                  </v-card-title>
                  <v-container>


                    <v-flex v-if="question.type === 'textfield'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        label="Ερώτηση"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        label="Περιγραφή"
                      ></v-text-field>
                      <v-checkbox
                        label="Προαιρετικό"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>save</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'combobox'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        label="Ερώτηση"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        label="Περιγραφή"
                      ></v-text-field>
                      <v-list>
                        <v-btn flat outline fab small @click="nextItemId += 1; question.items.push({id: nextItemId, value: ''});" v-if="question.editing">
                          <v-icon>add</v-icon>
                        </v-btn>
                        <template v-for="item in question.items">
                          <v-list-tile
                              :key="item.id"
                          >
                            <v-list-tile-content>
                              <v-text-field
                                name="input-1"
                                v-model="item.value"
                                append-icon="delete"
                                @click:append="question.items.remove(item)"
                              ></v-text-field>
                              <v-icon>delete</v-icon>
                            </v-list-tile-content>
                          </v-list-tile>
                        </template>
                      </v-list>
                      <v-checkbox
                        label="Προαιρετικό"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>save</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'checkboxGroup'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        label="Ερώτηση"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        label="Περιγραφή"
                      ></v-text-field>
                      <v-list>
                        <v-btn flat outline fab small @click="nextItemId += 1; question.checkboxes.push({id: nextItemId, label: '', value: false});"
                          v-if="question.editing">
                          <v-icon>add</v-icon>
                        </v-btn>
                        <template v-for="item in question.checkboxes">
                          <v-list-tile
                              :key="item.id"
                          >
                            <v-list-tile-content>
                              <v-text-field
                                name="input-1"
                                v-model="item.label"
                                append-icon="delete"
                                @click:append="question.checkboxes.remove(item)"
                              ></v-text-field>
                              <v-icon>delete</v-icon>
                            </v-list-tile-content>
                          </v-list-tile>
                        </template>
                      </v-list>
                      <v-checkbox
                        label="Προαιρετικό"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>save</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'radioGroup'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        label="Ερώτηση"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        label="Περιγραφή"
                      ></v-text-field>
                      <v-list>
                        <v-btn flat outline fab small @click="nextItemId += 1; question.radios.push({id: nextItemId, label: '', value: false});"
                          v-if="question.editing">
                          <v-icon>add</v-icon>
                        </v-btn>
                        <template v-for="item in question.radios">
                          <v-list-tile
                              :key="item.id"
                          >
                            <v-list-tile-content>
                              <v-text-field
                                name="input-1"
                                v-model="item.label"
                                append-icon="delete"
                                @click:append="question.radios.remove(item)"
                              ></v-text-field>
                              <v-icon>delete</v-icon>
                            </v-list-tile-content>
                          </v-list-tile>
                        </template>
                      </v-list>
                      <v-checkbox
                        label="Προαιρετικό"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>save</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>



                    <v-flex v-if="question.type === 'mapPointer'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        label="Ερώτηση"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        label="Περιγραφή"
                      ></v-text-field>
                      <v-list>
                        <v-btn flat outline fab small @click="nextItemId += 1; question.buttons.push({id: nextItemId, label: '', coords: null});"
                          v-if="question.editing">
                          <v-icon>add</v-icon>
                        </v-btn>
                        <template v-for="item in question.buttons">
                          <v-list-tile
                              :key="item.id"
                          >
                            <v-list-tile-content>
                              <v-text-field
                                name="input-1"
                                v-model="item.label"
                                append-icon="delete"
                                @click:append="question.buttons.remove(item)"
                              ></v-text-field>
                              <v-icon>delete</v-icon>
                            </v-list-tile-content>
                          </v-list-tile>
                        </template>
                      </v-list>
                      <v-checkbox
                        label="Προαιρετικό"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>save</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'mapPointerMultiple'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        label="Ερώτηση"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        label="Περιγραφή"
                      ></v-text-field>
                      <v-checkbox
                        label="Προαιρετικό"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>save</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'titleDescription'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        label="Τίτλος"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        label="Περιγραφή"
                      ></v-text-field>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>save</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>

                  </v-container>
                </v-card>
              </v-flex>
            </v-layout>
          </v-card>
        </v-container>

        <v-layout row wrap xs12 sm12 md12>
          <v-flex>
            <v-card>
              <v-card-title primary-title>
                  <h3 class="headline mb-0">Προσθήκη ερώτησης</h3>
                  <v-flex xs12 sm12 md12>
                    <v-select
                      v-bind:items="questionTypes"
                      item-value="type"
                      item-text="name"
                      v-model="newQuestion"
                      label="Τύπος ερώτησης"
                      single-line
                      menu-props='bottom'
                      v-on:input="loadQuestionType"
                    ></v-select>
                  </v-flex>
              </v-card-title>
            </v-card>
          </v-flex>
        </v-layout>
        <div>
          <v-btn @click="saveQuestionnaire().then(() => { this.loading = false });">
            ΑΠΟΘΗΚΕΥΣΗ ΕΡΩΤΗΜΑΤΟΛΟΓΙΟΥ<v-icon dark>save</v-icon>
          </v-btn>
          <v-btn @click="$store.commit('setQuestionnaireMode', 'normal')">
            ΑΚΥΡΟ<v-icon dark>cancel</v-icon>
          </v-btn>
          <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
        </div>
      </v-flex>
    </v-layout>
</template>
<script>
import ol from 'openlayers';
import axios from 'axios';
import olMap from '../js/map';
import config from '../config';

export default {
  data() {
    return {
      loading: false,
      newQuestion: null,
      nextId: 0,
      nextItemId: 0,
      questionTypes: [
        { type: 'textfield', name: 'Κείμενο' },
        { type: 'combobox', name: 'Αναπτυσσόμενο μενού' },
        { type: 'checkboxGroup', name: 'Πλαίσια ελέγχου' },
        { type: 'radioGroup', name: 'Πολλαπλής επιλογής' },
        { type: 'mapPointer', name: 'Υπόδειξη στο χάρτη' },
        { type: 'mapPointerMultiple', name: 'Πολλαπλές υποδείξεις στο χάρτη' },
        { type: 'titleDescription', name: 'Τίτλος και περιγραφή' },
      ],
      questionnaire: {
        questions: [],
        properties: {
          owner: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
          mapExtent: [],
          loginRequired: false,
          pages: 0,
          introduction: {
            items: [
              {
                id: 1,
                type: 'heading',
                value: null,
              },
              {
                id: 2,
                type: 'text',
                value: null,
              },
              {
                id: 3,
                type: 'loginRequired',
                value: false,
              },
            ],
          },
        },
      },
    };
  },
  watch: {
    '$store.state.questionnaireFeatures': function set() {
      const feature = this.$store.state.questionnaireFeatures[0];
      this.questionnaire.properties.mapExtent = feature.getGeometry().getExtent();
    },
  },
  methods: {
    pageBreakChangeControl() {
      let page = 0;
      this.questionnaire.questions.forEach((q) => {
        // console.log(q.pageBreak);
        if (q.pageBreak) {
          page += 1;
          // eslint-disable-next-line
          q.page = page;
        } else {
          // eslint-disable-next-line
          q.page = page;
        }
      });
      this.questionnaire.properties.pages = page;
    },
    async saveQuestionnaire() {
      this.$store.commit('setQuestionnaireMode', 'normal');
      try {
        const url = `${config.url}/questionnaires/save`;
        console.log(url);
        const data = this.questionnaire;
        axios.post(url, { data }, {
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          console.log('response to save :: ', response);
          if (response.data.type === 'new') {
            console.log('questionnaire new');
          } else if (response.data.type === 'replaced') {
            console.log('questionnaire replaced');
          }
        });
      } catch (error) {
        this.error = error.response.data.error;
      }
      console.log('questionnaire json is :: ', JSON.stringify(this.questionnaire));
    },
    removeQuestion(question) {
      this.questionnaire.questions.remove(question);
    },
    reorderQuestions(question, direction) {
      const index = this.questionnaire.questions.findIndex(item => item.id === question.id);
      if (direction === 'up') {
        this.questionnaire.questions.move(index, index - 1);
      } else if (direction === 'down') {
        this.questionnaire.questions.move(index, index + 1);
      }
      this.pageBreakChangeControl();
    },
    loadQuestionType() {
      console.log(this.newQuestion);
      if (this.newQuestion === 'textfield') {
        const textfield = {
          id: this.nextId,
          type: 'textfield',
          page: 0,
          title: null,
          description: null,
          value: null,
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.questionnaire.questions.push(textfield);
      }
      if (this.newQuestion === 'combobox') {
        const combobox = {
          id: this.nextId,
          type: 'combobox',
          page: 0,
          title: null,
          description: null,
          value: null,
          items: [{ id: `i${this.nextItemId}`, value: '' }],
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(combobox);
      }
      if (this.newQuestion === 'checkboxGroup') {
        const checkboxGroup = {
          id: this.nextId,
          type: 'checkboxGroup',
          page: 0,
          title: null,
          description: null,
          value: null,
          checkboxes: [{ id: `i${this.nextItemId}`, label: '', value: false }],
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(checkboxGroup);
      }
      if (this.newQuestion === 'radioGroup') {
        const radioGroup = {
          id: this.nextId,
          type: 'radioGroup',
          page: 0,
          title: null,
          description: null,
          value: null,
          radios: [{ id: `i${this.nextItemId}`, label: '', radioValue: false }],
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(radioGroup);
      }
      if (this.newQuestion === 'mapPointer') {
        const mapPointer = {
          id: this.nextId,
          type: 'mapPointer',
          page: 0,
          title: null,
          description: null,
          value: null,
          buttons: [{ id: `i${this.nextItemId}`, label: '', coords: null }],
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(mapPointer);
      }
      if (this.newQuestion === 'mapPointerMultiple') {
        const mapPointerMultiple = {
          id: this.nextId,
          type: 'mapPointerMultiple',
          page: 0,
          title: null,
          description: null,
          value: null,
          lines: [{ id: `i${this.nextItemId}`, value: '', coords: null }],
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(mapPointerMultiple);
      }
      if (this.newQuestion === 'titleDescription') {
        const titleDescription = {
          id: this.nextId,
          type: 'titleDescription',
          page: 0,
          title: null,
          description: null,
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(titleDescription);
      }
      this.nextId += 1;
      this.$nextTick(() => {
        this.newQuestion = null;
        this.pageBreakChangeControl();
      });
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
  },
  mounted() {
    this.$store.commit('setQuestionnaireMode', 'editor');
  },
};
// TODO
// save send to database
// show questionnaires in users account
// question validation rules
// localization
</script>
