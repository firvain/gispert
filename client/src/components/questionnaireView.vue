<template>
  <v-layout id="layout1" row wrap xs12 sm12 md12>
    <v-container v-if="pagehandler.currentPage === 0 && !submitted">
      <v-container fluid row
        v-for="item in questionnaire.properties.introduction.items"
        :key="item.id"
      >
        <h3 v-if="item.type === 'heading'" class="headline mb-0">{{ item.value }}</h3>
        <div v-if="item.type === 'text'" > {{ item.value }} </div>
        <img v-if="item.type === 'image'" :src="item.value" aspect-ratio="2.75"/>
      </v-container>
    </v-container>

    <v-layout v-if="!submitted" row wrap xs12 sm12 md12>
    <v-container pa-0 ma-0 row v-for="question in questionnaire.questions" :key="question.id">
      <!-- <v-card v-if="question.page === page && !deactivatedPages.includes(question.page + 1)"> -->
      <v-card v-if="question.page === pagehandler.currentPage && !pagehandler.deactivatedQuestions.includes(question.id)">
        <v-card-title primary-title>
          <div>
            <h3 :class="titleClass(question)">{{ question.title }} <span v-if="question.optional === true">*</span></h3>
            <v-alert color="error" icon="warning" :value="question.error">
              {{ $t('message.questionNotAnswered') }}
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
            :label="$t('message.yourAnswer')"
          ></v-text-field>
        </v-flex>

        <v-flex v-if="question.type === 'textarea'">
          <v-textarea
            name="input-1"
            v-model="question.value"
            :label="$t('message.yourAnswer')"
          ></v-textarea>
        </v-flex>

        <v-flex v-if="question.type === 'textfieldvalidation' && question.validation === 'email'">
          <v-text-field
            name="input-2"
            v-model="question.value"
            :label="$t('message.yourAnswer')"
            :rules="emailRules"
          ></v-text-field>
        </v-flex>

        <v-flex v-if="question.type === 'combobox'">
          <v-select
            v-bind:items="question.items"
            v-model="question.value"
            item-value="value"
            item-text="value"
            
            :label="$t('message.yourAnswer')"
            single-line
            menu-props="bottom"
            v-on:input="pagehandler.toggleSections(); pagehandler.toggleQuestions();"
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

        <v-container row wrap v-if="question.type === 'preferenceHierarchy'">
          <v-list one-line>
            <draggable v-model="question.optionsToSort" @start="drag=true" @end="drag=false">
              <template v-for='element in question.optionsToSort'>
                <v-list-tile :key="element.id" avatar class='force-hover'>
                  <v-list-tile-avatar>
                    <v-icon>drag_indicator</v-icon>
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title v-html="element.label"></v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
            </draggable>
          </v-list>
        </v-container>

        <v-container row wrap v-if="question.type === 'mapPointer'">
          <v-flex v-for="button in question.buttons" :key="button.id">{{ button.label }}
            <v-btn small fab dark :color="button.style.strkClr"
              @click="getFromMap(button.id, 'Point', button.label, button.style);
              $store.commit('setDrawMessage', '<code>Κάντε κλικ στο σημείο της απάντησής σας</code>');">
              <v-icon dark>location_on</v-icon>
            </v-btn>
          </v-flex>
        </v-container>

        <v-container row wrap v-if="question.type === 'mapLineString'">
          <v-flex v-for="button in question.buttons" :key="button.id">{{ button.label }}
            <v-btn small fab dark :color="button.style.strkClr"
              @click="getFromMap(button.id, 'LineString', button.label, button.style);
              $store.commit('setDrawMessage', '<code>Διπλό κλικ για ολοκλήρωση σχεδίασης,<br>Delete για διαγραφή τελευταίου σημείου</code>');">
              <v-icon dark>timeline</v-icon>
            </v-btn>
          </v-flex>
        </v-container>

        <v-container v-if="question.type === 'mapPointerMultiple'">
          <v-layout row wrap v-for="line in question.lines" :key="line.id">
            <v-flex xs10>
              <v-text-field
                name="input-1"
                v-model="line.value"
                :label="$t('message.yourAnswer')"
              ></v-text-field>
            </v-flex>
            <v-flex xs2>
              <v-btn small fab dark class="indigo"
                @click="getFromMap(line.id, 'Point', line.value, line.style);
                $store.commit('setDrawMessage', '<code>Κάντε κλικ στο σημείο της απάντησής σας</code>');">
                <v-icon dark>location_on</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
          <v-btn dark class="indigo" @click="addRow(question)">
            {{ $t('message.addLine')}}
          </v-btn>
        </v-container>
        <v-container v-if="question.type === 'mapLinesMultiple'">
          <v-layout row wrap v-for="line in question.lines" :key="line.id">
            <v-flex xs10>
              <v-text-field
                name="input-1"
                v-model="line.value"
                :label="$t('message.yourAnswer')"
              ></v-text-field>
            </v-flex>
            <v-flex xs2>
              <v-btn small fab dark class="indigo"
                @click="getFromMap(line.id, 'LineString', line.value, line.style);
                $store.commit('setDrawMessage', '<code>Διπλό κλικ για ολοκλήρωση σχεδίασης,<br>Delete για διαγραφή τελευταίου σημείου</code>');">
                <v-icon dark>timeline</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
          <v-btn dark class="indigo" @click="addRow(question)">
            {{ $t('message.addLine')}}
          </v-btn>
        </v-container>

        <v-container fluid v-if="question.type === 'tableOfCheckboxes'">
          <v-layout row wrap>
            <v-container>
              <v-flex xs12 md12>
                  <v-layout row wrap>
                      <v-flex xs1> 
                      </v-flex>
                      <v-flex xs1 ma-2 v-for="answer in question.horizontalValues" :key="answer.id">
                        {{ answer.text }}
                      </v-flex>
                  </v-layout>
              </v-flex>
              <v-flex xs12 md12>
                <v-layout row wrap v-for="item in question.items" :key="item.id">
                  <v-flex xs1 ma-1>{{ item.title }}</v-flex>
                  <v-flex ma-2 v-for="answer in item.answers" :key="answer.id" xs1>
                    <v-checkbox light v-model="answer.selected"></v-checkbox>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-container>
          </v-layout>
        </v-container>
<!-- 
        <v-container fluid v-if="question.type === 'tableOfRadios'">
          <v-layout row wrap>
            <v-container>
              <v-flex xs12 md12>
                  <v-layout row wrap>
                      <v-flex xs1> 
                        </v-flex>
                        <v-flex xs1 ma-2 v-for="answer in question.items[0].answers" :key="answer.text">
                          {{ answer.text }}
                        </v-flex>
                  </v-layout>
              </v-flex>
              <v-flex xs12 md12>
                <v-layout row wrap v-for="item in question.items" :key="item.title">
                  <v-flex xs1 ma-1>{{ item.title }}</v-flex>

                    <v-radio-group v-model="question.value" row>
                      <v-radio xs1
                        v-for="answer in item.answers"
                        :key="answer"
                        label="testing"
                      >{{ answer }}</v-radio>
                    </v-radio-group>

                </v-layout>
              </v-flex>
            </v-container>
          </v-layout>
        </v-container> -->


        </v-card-text>
      </v-card>
    </v-container>

    </v-layout>
    <v-layout row wrap v-if="!submitted">
      <!-- {{ pagehandler.labels() }} {{ pagehandler.currentPage }} {{ pagehandler.deactivatedPages }} -->
      <v-flex xs12>
        <v-btn dark block class="indigo" @click="submit('page');"
          v-if="pagehandler.showNext">
          {{ $t('message.nextSection')}} <span> &nbsp; {{ pagehandler.labels() }}</span>
        </v-btn>
        <v-btn dark block class="grey" @click="goToPreviousPage"
          v-if="pagehandler.showPrevious">
          {{ $t('message.previousSection')}}
        </v-btn>

        <v-btn dark block class="indigo" @click="submit('all')" v-if="pagehandler.showSubmit">
          {{ $t('message.submitQuestionnaire')}}<v-icon dark>send</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>

    <v-layout row wrap>
      <v-container>
        <v-alert color="success" icon="check_circle" :value="submitted">
          {{ $t('message.questionnaireSubmitted')}}
        </v-alert>
      </v-container>
    </v-layout>

      <v-snackbar
        :timeout=5000
        v-model="snackbarError"
        color= "red"
      >
        {{ $t('message.thereAreErrorsInQuestionnaire')}}
      </v-snackbar>
  </v-layout>
</template>
<script>
import ol from 'openlayers';
import axios from 'axios';
import draggable from 'vuedraggable';
import { PageHandler } from '@/components/classes/questionnaire';
import { app } from '../main';
import olMap from '../js/map';
import config from '../config';

export default {
  props: ['id'],
  components: {
    draggable,
  },
  data() {
    return {
      pagehandler: null,
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /[^@]+@[^.]+\..*/.test(v) || 'E-mail must be valid',
      ],
      snackbarError: false,
      submitted: false,
      page: 0,
      loading: false,
      questionnaire: null,
      target: '#layout1',
      options() {
        return {
          duration: 300,
          offset: 0,
        };
      },
      deactivatedPages: [],
      pagesQueue: null,
      lastPage: false,
      showNext: true,
      showPrevious: false,
    };
  },
  methods: {
    generateItemsTable(question) {
      console.log('generating table');
      const items = [];
      if (question.horizontalValues && question.verticalValues) {
        question.verticalValues.forEach((vv) => {
          const answers = [];
          question.horizontalValues.forEach((hv) => {
            answers.push({ id: `${hv.id}_${vv.id}`, text: hv.text, selected: hv.selected });
          });
          items.push({ id: vv.id, title: vv.title, answers });
        });
      }
      console.log(items);
      return items;
    },
    goToPreviousPage() {
      this.pagehandler.goToPreviousPage();
    },
    goToNextPage() {
      this.pagehandler.goToNextPage();
    },
    titleClass(question) {
      return !question.style.titleFontSize ? 'headline mb-0' : 'subheading';
    },
    toggleSections() {
      const pagesToAdd = [];
      const pagesToRemove = [];
      // console.log(selected);
      this.deactivatedPages = [];
      this.questionnaire.questions.forEach((question) => {
        // for each question check if has value
        if (question.type === 'combobox' && (question.value || question.optional === true)) {
          console.log('found combobox with value or optional:: ', question);
          question.items.forEach((item) => {
            if (item.activateSections && item.activateSections[0] !== '-' && question.value === item.value) {
              console.log('found item active to remove page from deactivated');
              item.activateSections.forEach((i) => {
                pagesToRemove.push(i);
              });
            }
            if (item.activateSections && item.activateSections[0] !== '-' && question.value !== item.value) {
              console.log('found item active to add page to deactivated');
              item.activateSections.forEach((i) => {
                pagesToAdd.push(i);
              });
            }
          });
        }
        if (question.type === 'combobox' && !question.value) {
          question.items.forEach((item) => {
            if (item.activateSections && item.activateSections[0] !== '-') {
              console.log('found combobox without value:: ', question);
              item.activateSections.forEach((i) => {
                pagesToAdd.push(i);
              });
            }
          });
        }
      });
      console.log(pagesToAdd, pagesToRemove);
      this.deactivatedPages = pagesToAdd.filter(p => !pagesToRemove.includes(p));
      const pagesQueue = {};
      for (let index = 1; index <= this.questionnaire.properties.pages + 1; index += 1) {
        console.log(this.deactivatedPages);
        if (this.deactivatedPages.includes(index)) {
          console.log('false');
          pagesQueue[`${index - 1}`] = false;
        } else {
          console.log('true');
          pagesQueue[`${index - 1}`] = true;
        }
      }
      console.log('pages queue:: ', pagesQueue);
      this.pagesQueue = pagesQueue;
    },
    scrollTop() {
      const container = document.getElementById('layout1');
      container.scrollTop = 0;
    },
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
      console.log('validation result :: ', !error);
      return !error;
    },
    addRow(question) {
      if (question.lines.length < 21) {
        question.lines.push({
          id: `${question.id}${question.lines.length + 1}`,
          value: null,
          coords: [],
          style: {
            strkWdth: 2,
            strkClr: 'blue',
            fllClr: 'orange',
          },
        });
      }
      console.log(`added this id:: ${question.id}${question.lines.length + 1}`);
    },
    async getValues() {
      const questionnaireResult = [];
      this.questionnaire.questions.forEach((q) => {
        if (q.page === this.pagehandler.currentPage) {
          if (q.type === 'textfield' || q.type === 'textfieldvalidation' || q.type === 'textarea') {
            if ((q.value && q.value.length > 0) ||
              (q.optional === true || this.pagehandler.deactivatedQuestions.includes(q.id))) {
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
            console.log(q);
            if (q.value !== null ||
              q.optional === true ||
              this.pagehandler.deactivatedQuestions.includes(q.id)) {
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
            if (errors.includes(true) ||
              q.optional === true ||
              this.pagehandler.deactivatedQuestions.includes(q.id)) {
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
            if (q.value ||
              q.optional === true ||
              this.pagehandler.deactivatedQuestions.includes(q.id)) {
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
          if (q.type === 'preferenceHierarchy') {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: q.optionsToSort,
              error: false,
            });
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
            if (coordinates.length === q.buttons.length || q.optional === true) {
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
          if (q.type === 'mapLineString') {
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
            if (coordinates.length === q.buttons.length || q.optional === true) {
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
          if (q.type === 'mapLinesMultiple') {
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
        if (q.type === 'textfield' || q.type === 'textfieldvalidation') {
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
        if (q.type === 'preferenceHierarchy') {
          questionnaireResult.push({
            id: q.id,
            title: q.title,
            value: q.optionsToSort,
            error: false,
            type: q.type,
          });
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
          if (coordinates.length === q.buttons.length || q.optional === true) {
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
        if (q.type === 'mapLineString') {
          const coordinates = [];
          const values = [];
          q.buttons.forEach((b) => {
            values.push(b.label);
            const features = this.$store.state.questionnaireFeatures;
            features.forEach((f) => {
              if (f.getProperties().buttonId === b.id) {
                f.setProperties({
                  label: b.label,
                });
                coordinates.push(geojsonFormat.writeFeatures([f]));
              }
            });
          });
          if (coordinates.length === q.buttons.length || q.optional === true) {
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
        if (q.type === 'mapLinesMultiple') {
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
        if (q.type === 'tableOfCheckboxes') {
          questionnaireResult.push({
            id: q.id,
            title: q.title,
            value: q.items,
            error: false,
            type: q.type,
          });
        }
      });
      console.log('result:: ', questionnaireResult);
      return questionnaireResult;
    },
    getFromMap(id, type, title, style) {
      olMap.removeFeaturesFromLayer('customLayer', 'buttonId', [id]);
      this.$store.commit('setQuestionnaireFeatureId', id);
      const featureStyle = {
        strkWdth: style.strkWdth,
        strkClr: style.strkClr,
        fllClr: style.fllClr,
        radius: style.radius,
        messages: title,
      };
      this.$store.commit('setDrawnFeatureStyle', featureStyle);
      this.$store.commit('setMapState', 'mapAvailable');
      olMap.setActiveInteraction(type);
    },
    submit(type) {
      this.getValues().then((res) => {
        this.validate(res).then((v) => {
          if (v) {
            console.log('next page', v);
            // this.page += 1;
            this.pagehandler.goToNextPage();
            this.scrollTop();
            if (type === 'all') {
              this.getAllValues().then((result) => {
                console.log('send to server', result, typeof (result));
                const questionnaireToPost = {
                  qid: this.questionnaire._id, // eslint-disable-line no-underscore-dangle
                  results: result,
                  properties: this.questionnaire.properties,
                  submittedOn: Date.now(),
                  submittedBy: this.getUserId(),
                };
                console.log('this is the questionnaire to post:: ', questionnaireToPost);
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
    getUserId() {
      let id;
      if (this.$store.state.user) { // eslint-disable-line no-underscore-dangle
        id = this.$store.state.user._id; // eslint-disable-line no-underscore-dangle
      } else {
        id = null;
      }
      return id;
    },
    sendToServer(questionnaire) {
      console.log('send this to server:: ', questionnaire);
      const url = `${config.url}/public/submitQuestionnaire`;
      const questionnaireToPost = questionnaire;
      axios.post(url, { questionnaireToPost }).then((response) => {
        console.log('this is the response of sending questionnaire to server:: ', response, response.status);
        if (response.status === 200) {
          console.log('response status is 200');
          this.submitted = true;
          this.$store.commit('resetQuestionnaire');
          this.questionnaire = null;
          console.log('questionnaire reset?', this.questionnaire);
        }
      });
      // .catch(console.error)
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
        this.setLocale(this.questionnaire.properties.locale);
      }).then(() => {
        this.pagehandler = new PageHandler(this.questionnaire);
        console.log('find deactivated pages');
        this.questionnaire.questions.forEach((q) => {
          if (q.items) {
            q.items.forEach((i) => {
              if (i.activateSections && i.activateSections !== ''
              && i.activateSections !== null && i.activateSections[0] !== '-') {
                // deactivatedPage = parseInt(i.activateSections) - 1;
                console.log(i.activateSections, typeof (i.activateSections));
                i.activateSections.forEach((as) => {
                  console.log('added this page:: ', as);
                  this.deactivatedPages.push(as);
                });
              }
            });
          }
        });
      });
    },
    setLocale(value) {
      app.$i18n.locale = value;
    },
  },
  mounted() {
    console.log('mounted questionnaire');
    if (this.$route.name === 'questionnaire') {
      this.$store.commit('setQuestionnaireMode', 'answering');
    } else {
      this.$store.commit('setQuestionnaireMode', 'viewer');
    }
    this.loadQuestionnaire();
    // TODO create combobox and checkbox to input Other value by typing
    // TODO custom message after q submittion
  },
};
</script>
<style scoped>
  #layout1 {
    width: auto;
    height: 87vh;
  }
  .force-hover:hover {
    background-color: bisque;
    cursor: pointer;
  }
</style>
