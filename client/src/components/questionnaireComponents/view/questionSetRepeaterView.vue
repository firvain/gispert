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
        <comboboxView :question='question' :pagehandler='pagehandler'></comboboxView>
        <checkboxGroupView :question='question'></checkboxGroupView>
        <radioButtonsGroupView :question='question'></radioButtonsGroupView>
        <preferenceHierarchyView :question='question'></preferenceHierarchyView>
        <mapPointerView :question='question'></mapPointerView>
        <mapLineStringView :question='question'></mapLineStringView>
        <mapPointerMultipleView :question='question'></mapPointerMultipleView>
        <mapLineStringMultipleView :question='question'></mapLineStringMultipleView>
        <mapPointOrLineStringMultipleView :question='question'></mapPointOrLineStringMultipleView>

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
import radioButtonsGroupView from '@/components/questionnaireComponents/view/radioButtonsGroupView';
import tableOfRadioButtonsView from '@/components/questionnaireComponents/view/tableOfRadioButtonsView';
import tableOfCheckboxesView from '@/components/questionnaireComponents/view/tableOfCheckboxesView';
import questionSetRepeaterView from '@/components/questionnaireComponents/view/questionSetRepeaterView';

export default {
  name: 'questionSetRepeaterView',
  props: ['question', 'questionnaire'],
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
      question.repeatQuestions.forEach((q) => {
        console.log('repeat this question:: ', JSON.stringify(q));
      });
      const repeat = [];
      question.repeatQuestions.forEach((r) => {
        repeat.push(r.id);
      });
      const newQuestionSet = this.questionnaire.questions.filter(q =>
      repeat.includes(q.id));
      newQuestionSet.forEach((n) => {
        console.log('set of questions to clone:: ', JSON.stringify(n));
      });
      newQuestionSet.forEach((s) => {
        console.log('question in set::', JSON.stringify(s));
        const cloneQuestion = { ...s };
        cloneQuestion.id = `${this.nextId}_${idIncrement}`;
        console.log('question clone::', JSON.stringify(cloneQuestion));
        idIncrement += 1;
        console.log('adding clone to::', JSON.stringify(question));
        question.questions.push(cloneQuestion);
      });
      console.log('-------------------------------------');
      // newQuestionSet.forEach((q) => {
      //   const repeatable = this.questionnaire.questions.filter(x => x.id === question.id);
      //   console.log('repeatable found :: ', repeatable);
      //   const newQ = JSON.parse(JSON.stringify(q));
      //   newQ.id = `${this.nextId}_${idIncrement}`;
      //   newQ.value = null;
      //   newQ.error = false;
      //   newQ.parentId = q.id;
      //   // console.log('q:: ', newQ.id);
      //   if (newQ.type === 'mapPointer' || newQ.type === 'mapLineString') {
      //     newQ.buttons.forEach((b) => { b.id = `i${this.nextId}_${idIncrement}`; });
      //   }
      //   if (newQ.type === 'mapPointerMultiple' || newQ.type === 'mapLinesMultiple') {
      //     newQ.lines.forEach((b) => { b.id = `i${this.nextId}_${idIncrement}`; });
      //   }
      //   repeatable[0].questions.push(newQ);
      //   idIncrement += 1;
      //   console.log('repeatable :: ', JSON.stringify(repeatable[0]));
      // });
      /* eslint-enable no-param-reassign */
    },
  },
};
</script>