<template>
  <v-layout id="layout1" row wrap>
    <v-container v-if="pagehandler.currentPage === 0 && !submitted">
      <v-container fluid row pa-0 ma-0
        v-for="item in questionnaire.properties.introduction.items"
        :key="item.id"
      >
        <h3 v-if="item.type === 'heading'" class="headline mb-0">{{ item.value }}</h3>
        <div v-if="item.type === 'text'" > {{ item.value }} </div>
        <v-card v-if="item.type === 'image'">
          <v-img
            :src="item.value"
            class="grey darken-4"
          ></v-img>
        </v-card>
      </v-container>
    </v-container>

    <v-layout v-if="!submitted" row wrap xs12 sm12 md12 justify-center>
    <v-container pa-0 ma-0 row v-for="question in questionnaire.questions" :key="question.id">
      <v-card v-if="question.page === pagehandler.currentPage && !pagehandler.deactivatedQuestions.includes(question.id)">
        <v-card-title primary-title>
          <div>
            <h3 :class="titleClass(question)">{{ question.title }} 
              <span v-if="question.optional === true && question.type !== 'titleDescription'">*</span>
            </h3>
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
        <v-container v-if="question.type === 'mapPointsLinesMultiple'">
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
                $store.commit('setDrawMessage', '<code>Kλικ για ολοκλήρωση υπόδειξης</code>');">
                <v-icon dark>location_on</v-icon>
              </v-btn>
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

        <tableOfCheckboxesView :question='question'></tableOfCheckboxesView>
        <radioButtonsGroupView :question='question'></radioButtonsGroupView>
        <tableOfRadioButtonsView :question='question'></tableOfRadioButtonsView>

        <v-container ma-0 pa-0 v-if="question.type === 'repeatable'">
          <v-flex v-for='question in question.questions' :key='question.id'>
            <questionnaireComponents :question='question'></questionnaireComponents>
          </v-flex>
          <v-btn block @click='addQuestionSet(question)'>{{ question.buttonText }}</v-btn>
        </v-container>
        </v-card-text>
      </v-card>
    </v-container>

    </v-layout>
    <v-layout row wrap v-if="!submitted">
      <v-flex xs12>
        <v-btn dark block class="indigo" @click="submit('page');"
          v-if="pagehandler.showNext">
          {{ $t('message.nextSection')}}
          <!-- <span> &nbsp; {{ pagehandler.labels() }}</span> -->
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
import axios from 'axios';
import draggable from 'vuedraggable';
import { PageHandler } from '@/components/classes/questionnaire';
import questionnaireComponents from '@/components/questionnaireComponents/questionnaireComponents';
import radioButtonsGroupView from '@/components/questionnaireComponents/radioButtonsGroupView';
import tableOfRadioButtonsView from '@/components/questionnaireComponents/tableOfRadioButtonsView';
import tableOfCheckboxesView from '@/components/questionnaireComponents/tableOfCheckboxesView';
import QuestionnaireValidator from '@/components/classes/questionnaireValidator';
import { app } from '../main';
import olMap from '../js/map';
import config from '../config';

export default {
  props: ['id'],
  components: {
    draggable,
    questionnaireComponents,
    radioButtonsGroupView,
    tableOfRadioButtonsView,
    tableOfCheckboxesView,
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
      loading: false,
      questionnaire: null,
      target: '#layout1',
      options() {
        return {
          duration: 300,
          offset: 0,
        };
      },
    };
  },
  computed: {
    nextId: {
      cache: false,
      get() {
        return String(Date.now()) + Math.floor(Math.random() * 10000);
      },
    },
  },
  methods: {
    addQuestionSet(question) {
      /* eslint-disable no-param-reassign */
      let idIncrement = 0;
      const newQuestionSet = this.questionnaire.questions.filter((el) => {
        // console.log(el);
        let value;
        if (el.page === question.repeatsPage && el.type !== 'repeatable') {
          value = el;
        }
        return value;
      });
      // console.log('new set :: ', newQuestionSet);
      newQuestionSet.forEach((q) => {
        const repeatable = this.questionnaire.questions.filter(x => x.id === question.id);
        // console.log('repeatable found :: ', repeatable);
        const newQ = JSON.parse(JSON.stringify(q));
        newQ.id = `${this.nextId}_${idIncrement}`;
        newQ.value = null;
        newQ.error = false;
        newQ.parentId = q.id;
        // console.log('q:: ', newQ.id);
        if (newQ.type === 'mapPointer' || newQ.type === 'mapLineString') {
          newQ.buttons.forEach((b) => { b.id = `i${this.nextId}_${idIncrement}`; });
        }
        if (newQ.type === 'mapPointerMultiple' || newQ.type === 'mapLinesMultiple') {
          newQ.lines.forEach((b) => { b.id = `i${this.nextId}_${idIncrement}`; });
        }
        repeatable[0].questions.push(newQ);
        idIncrement += 1;
        // console.log('repeatable :: ', JSON.stringify(repeatable[0]));
      });
      /* eslint-enable no-param-reassign */
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
    scrollTop() {
      const container = document.getElementById('layout1');
      container.scrollTop = 0;
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
      // console.log(`added this id:: ${question.id}${question.lines.length + 1}`);
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
      const validator = new QuestionnaireValidator(this.questionnaire);
      if (type === 'all' &&
        validator.validate('all', this.pagehandler.deactivatedQuestions, this.pagehandler.deactivatedPages)) {
        this.pagehandler.goToNextPage();
        this.scrollTop();
        // console.log('submit all');
        const questionnaireToPost = {
          qid: this.questionnaire._id, // eslint-disable-line no-underscore-dangle
          results: validator.getValues('all', this.pagehandler.deactivatedQuestions, this.pagehandler.deactivatedPages),
          properties: this.questionnaire.properties,
          submittedOn: Date.now(),
          submittedBy: this.getUserId(),
        };
        this.sendToServer(questionnaireToPost);
      } else if (type === 'page'
        && validator.validate(this.pagehandler.currentPage,
        this.pagehandler.deactivatedQuestions,
        this.pagehandler.deactivatedPages)) {
        // console.log('submit page');
        this.pagehandler.goToNextPage();
        this.scrollTop();
      } else {
        this.snackbarError = true;
      }
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
      const url = `${config.url}/public/submitQuestionnaire`;
      const questionnaireToPost = questionnaire;
      axios.post(url, { questionnaireToPost }).then((response) => {
        if (response.status === 200) {
          this.submitted = true;
          this.$store.commit('resetQuestionnaire');
          this.questionnaire = null;
        }
      })
      .catch(console.error);
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
        if (this.$store.state.questionnaire.properties.activateMap === false) {
          this.$eventHub.$emit('deactivateMap');
        }
      });
    },
    setLocale(value) {
      app.$i18n.locale = value;
    },
  },
  mounted() {
    // console.log('mounted questionnaire');
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
  .rotatedText {
    -ms-transform: rotate(-90deg); /* IE 9 */
    -webkit-transform: rotate(-90deg); /* Safari 3-8 */
    transform: rotate(-90deg);
  }
</style>
