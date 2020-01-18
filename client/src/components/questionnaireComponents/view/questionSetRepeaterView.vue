<template name='questionSetRepeaterView'>
  <v-container fluid v-if="question.type === 'repeatable'" pa-0 ma-0>
    <v-flex v-for='question in question.questions' :key='question.id'>
        <div>
          <h3 :class="titleClass(question)">{{ question.title }}
            <span v-if="question.optional === true && question.type !== 'titleDescription'">*</span>
          </h3>
          <v-alert color="error" icon="warning" :value="question.error">
            {{ $t('message.questionNotAnswered') }}
          </v-alert>
          <div> {{ question.description }} </div>
        </div>
        <tableOfCheckboxesView :question='question'></tableOfCheckboxesView>
        <tableOfRadioButtonsView :question='question'></tableOfRadioButtonsView>
        <textFieldView :question='question'></textFieldView>
        <textFieldValidation :question='question'></textFieldValidation>
        <textAreaView :question='question'></textAreaView>
        <comboboxView :question='question'></comboboxView>
        <checkboxGroupView :question='question'></checkboxGroupView>
        <radioButtonsGroupView :question='question'></radioButtonsGroupView>
        <preferenceHierarchyView :question='question'></preferenceHierarchyView>
        <mapPointerView :question='question'></mapPointerView>
        <mapLineStringView :question='question'></mapLineStringView>
        <mapPointerMultipleView :question='question'></mapPointerMultipleView>
        <mapLineStringMultipleView :question='question'></mapLineStringMultipleView>
        <mapPointOrLineStringMultipleView :question='question'></mapPointOrLineStringMultipleView>
        <selectFromMapView :question='question'></selectFromMapView>

        <questionSetRepeaterView :question='question' :questionnaire='questionnaire' />
        <!-- <v-container fluid v-if="question.type === 'repeatable'" pa-0 ma-0> a repeater
        </v-container> -->
    </v-flex>
    <v-btn block @click='addQuestionSet(question)'>{{ question.buttonText }}</v-btn>
  </v-container>
</template>
<script>
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
import questionSetRepeaterView from '@/components/questionnaireComponents/view/questionSetRepeaterView';

export default {
  name: 'questionSetRepeaterView',
  props: ['question', 'questionnaire', 'pagehandler'],
  components: {
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
    questionSetRepeaterView,
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
    titleClass(question) {
      return !question.style.titleFontSize ? 'headline mb-0' : 'subheading';
    },
    addQuestionSet(question) {
      /* eslint-disable no-param-reassign */
      let idIncrement = 0;
      const repeat = [];
      const idsTable = [];
      question.repeatQuestions.forEach((r) => {
        repeat.push(r.id);
      });
      const newQuestionSet = this.questionnaire.questions.filter(q =>
      repeat.includes(q.id));
      newQuestionSet.forEach((s) => {
        const cloneQuestion = this.jsonCopy(s);
        cloneQuestion.id = `${this.nextId}_${idIncrement}`;
        const newIdJoin = { newId: cloneQuestion.id, oldId: s.id };
        idsTable.push(newIdJoin);
        if (cloneQuestion.type === 'mapPointer'
        || cloneQuestion.type === 'mapLineString'
        || cloneQuestion.type === 'mapPointerMultiple'
        || cloneQuestion.type === 'mapLinesMultiple') {
          cloneQuestion.buttons.forEach((b) => { b.id = `i${this.nextId}_${idIncrement}`; });
        }
        cloneQuestion.parentId = s.id;
        idIncrement += 1;
        question.questions.push(cloneQuestion);
      });
      console.log('table of ids::', idsTable);
      question.questions.forEach((q) => {
        if (q.type === 'combobox') {
          // console.log('must repeat selection rules:: ', q.items);
          q.items.forEach((i) => {
            if (i.activateQuestions && i.activateQuestions.length > 0) {
              console.log('what to activate:: ', i.activateQuestions);
              i.activateQuestions.forEach((a) => {
                console.log('search and replace this::', a.id);
                const idToReplaceWith = idsTable.find(x => x.oldId === a.id).newId;
                a.id = idToReplaceWith;
              });
            }
          });
        }
      });
      console.log('final question set:: ', question.questions);
      /* eslint-enable no-param-reassign */
    },
    jsonCopy(src) {
      return JSON.parse(JSON.stringify(src));
    },
  },
};
</script>