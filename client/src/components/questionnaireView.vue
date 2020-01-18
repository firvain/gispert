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

        <tableOfCheckboxesView v-if='question.type === "tableOfCheckboxes"' :question='question'></tableOfCheckboxesView>
        <tableOfRadioButtonsView v-if='question.type === "tableOfRadioButtons"' :question='question'></tableOfRadioButtonsView>
        <textFieldView v-if='question.type === "textfield"' :question='question'></textFieldView>
        <textFieldValidation v-if='question.type === "textfieldvalidation"' :question='question'></textFieldValidation>
        <textAreaView v-if='question.type === "textarea"' :question='question'></textAreaView>
        <comboboxView v-if='question.type === "combobox"' :question='question' :pagehandler='pagehandler'></comboboxView>
        <checkboxGroupView v-if='question.type === "checkboxGroup"' :question='question'></checkboxGroupView>
        <radioButtonsGroupView v-if='question.type === "radioButtonsGroup"' :question='question'></radioButtonsGroupView>
        <preferenceHierarchyView v-if='question.type === "preferenceHierarchy"' :question='question'></preferenceHierarchyView>
        <mapPointerView v-if='question.type === "mapPointer"' :question='question'></mapPointerView>
        <mapLineStringView v-if='question.type === "mapLineString"' :question='question'></mapLineStringView>
        <mapPointerMultipleView v-if='question.type === "mapPointerMultiple"' :question='question'></mapPointerMultipleView>
        <mapLineStringMultipleView v-if='question.type === "mapLineStringMultiple"' :question='question'></mapLineStringMultipleView>
        <mapPointOrLineStringMultipleView v-if='question.type === "mapPointsLinesMultiple"' :question='question'></mapPointOrLineStringMultipleView>
        <tableOfInputsView v-if='question.type === "tableOfInputs"' :question='question'></tableOfInputsView>
        <selectFromMapView v-if='question.type === "mapSelector"' :question='question'></selectFromMapView>

        <questionSetRepeaterView v-if='question.type === "repeatable"' :question='question' :questionnaire='questionnaire'></questionSetRepeaterView>

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
import { PageHandler } from '@/components/classes/questionnaire';
import QuestionnaireValidator from '@/components/classes/questionnaireValidator';
import textFieldView from '@/components/questionnaireComponents/view/textFieldView';
import textFieldValidation from '@/components/questionnaireComponents/view/textFieldValidationView';
import textAreaView from '@/components/questionnaireComponents/view/textAreaView';
import comboboxView from '@/components/questionnaireComponents/view/comboboxView';
import checkboxGroupView from '@/components/questionnaireComponents/view/checkboxGroupView';
import preferenceHierarchyView from '@/components/questionnaireComponents/view/preferenceHierarchyView';
import mapPointerView from '@/components/questionnaireComponents/view/mapPointerView';
import mapLineStringView from '@/components/questionnaireComponents/view/mapLineStringView';
import mapPointerMultipleView from '@/components/questionnaireComponents/view/mapPointerMultipleView';
import mapLineStringMultipleView from '@/components/questionnaireComponents/view/mapLineStringMultipleView';
import mapPointOrLineStringMultipleView from '@/components/questionnaireComponents/view/mapPointOrLineStringMultipleView';
import selectFromMapView from '@/components/questionnaireComponents/view/selectFromMapView';
import radioButtonsGroupView from '@/components/questionnaireComponents/view/radioButtonsGroupView';
import tableOfRadioButtonsView from '@/components/questionnaireComponents/view/tableOfRadioButtonsView';
import tableOfCheckboxesView from '@/components/questionnaireComponents/view/tableOfCheckboxesView';
import tableOfInputsView from '@/components/questionnaireComponents/view/tableOfInputsView';
// import questionSetRepeaterView from
// '@/components/questionnaireComponents/view/questionSetRepeaterView';
import { app } from '../main';
import olMap from '../js/map';
import config from '../config';

export default {
  name: 'questionnaireview',
  props: ['id'],
  components: {
    questionSetRepeaterView: () => import('@/components/questionnaireComponents/view/questionSetRepeaterView'),
    textFieldView,
    textFieldValidation,
    textAreaView,
    comboboxView,
    checkboxGroupView,
    preferenceHierarchyView,
    mapPointerView,
    mapLineStringView,
    mapPointerMultipleView,
    mapLineStringMultipleView,
    mapPointOrLineStringMultipleView,
    selectFromMapView,
    radioButtonsGroupView,
    tableOfRadioButtonsView,
    tableOfCheckboxesView,
    tableOfInputsView,
    // questionSetRepeaterView,
  },
  data() {
    return {
      pagehandler: null,
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
  methods: {
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
