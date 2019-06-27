import ol from 'openlayers';
import store from '../../store';

class QuestionnaireValidator {
  constructor(questionnaire) {
    this.questionnaire = questionnaire;
  }
  set questionnaireForValidation(v) {
    return this.questionnaire;
  }
  get validatedQuestionnaire() {
    return this.questionnaire;
  }
  static checkErrorsForQuestion(q, deactivatedQuestions, deactivatedPages) {
    const geojsonFormat = new ol.format.GeoJSON();
    let questionResult = null;

    if (q.type === 'textfield' || q.type === 'textfieldvalidation' || q.type === 'textarea') {
      if ((q.value && q.value.length > 0) ||
      (q.optional === true || deactivatedQuestions.includes(q.id)
      || deactivatedPages.includes(q.page))) {
        questionResult = {
          id: q.id,
          title: q.title,
          value: q.value,
          error: false,
          type: q.type,
        };
      } else {
        questionResult = {
          id: q.id,
          title: q.title,
          value: q.value,
          error: true,
          type: q.type,
        };
      }
    }
    if (q.type === 'combobox') {
      if (q.value !== null ||
        q.optional === true ||
        deactivatedQuestions.includes(q.id) ||
        deactivatedPages.includes(q.page)) {
        questionResult = {
          id: q.id,
          title: q.title,
          value: q.value,
          error: false,
          type: q.type,
        };
      } else {
        questionResult = {
          id: q.id,
          title: q.title,
          value: q.value,
          error: true,
          type: q.type,
        };
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
      deactivatedQuestions.includes(q.id) ||
      deactivatedPages.includes(q.page)) {
        questionResult = {
          id: q.id,
          title: q.title,
          value: boxes,
          error: false,
          type: q.type,
        };
      } else {
        questionResult = {
          id: q.id,
          title: q.title,
          value: boxes,
          error: true,
          type: q.type,
        };
      }
    }
    if (q.type === 'radioGroup') {
      if (q.value ||
        q.optional === true ||
        deactivatedQuestions.includes(q.id) ||
        deactivatedPages.includes(q.page)) {
        questionResult = {
          id: q.id,
          title: q.title,
          value: q.value,
          error: false,
          type: q.type,
        };
      } else {
        questionResult = {
          id: q.id,
          title: q.title,
          value: q.value,
          error: true,
          type: q.type,
        };
      }
    }
    if (q.type === 'preferenceHierarchy') {
      questionResult = {
        id: q.id,
        title: q.title,
        value: q.optionsToSort,
        error: false,
        type: q.type,
      };
    }
    if (q.type === 'mapPointer') {
      const coordinates = [];
      const values = [];
      q.buttons.forEach((b) => {
        const features = store.state.questionnaireFeatures;
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
      if (coordinates.length === q.buttons.length ||
        q.optional === true ||
        deactivatedQuestions.includes(q.id) ||
        deactivatedPages.includes(q.page)) {
        questionResult = {
          id: q.id,
          title: q.title,
          coordinates,
          value: values,
          error: false,
          type: q.type,
        };
      } else {
        questionResult = {
          id: q.id,
          title: q.title,
          coordinates,
          value: values,
          error: true,
          type: q.type,
        };
      }
    }
    if (q.type === 'mapLineString') {
      const coordinates = [];
      const values = [];
      q.buttons.forEach((b) => {
        values.push(b.label);
        const features = store.state.questionnaireFeatures;
        features.forEach((f) => {
          if (f.getProperties().buttonId === b.id) {
            f.setProperties({
              label: b.label,
            });
            coordinates.push(geojsonFormat.writeFeatures([f]));
          }
        });
      });
      if (coordinates.length === q.buttons.length ||
        q.optional === true ||
        deactivatedQuestions.includes(q.id) ||
        deactivatedPages.includes(q.page)) {
        questionResult = {
          id: q.id,
          title: q.title,
          coordinates,
          value: values,
          error: false,
          type: q.type,
        };
      } else {
        questionResult = {
          id: q.id,
          title: q.title,
          coordinates,
          value: values,
          error: true,
          type: q.type,
        };
      }
    }
    if (q.type === 'mapPointerMultiple') {
      const coordinates = [];
      const values = [];
      q.lines.forEach((b) => {
        // console.log('b:: ', b);
        if (b.value) {
          values.push(b.value);
          const features = store.state.questionnaireFeatures;
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
      if ((values.length > 0 && coordinates.length > 0) ||
        q.optional === true ||
        deactivatedQuestions.includes(q.id) ||
        deactivatedPages.includes(q.page)) {
        questionResult = {
          id: q.id,
          title: q.title,
          value: values,
          coordinates,
          error: false,
          type: q.type,
        };
      } else {
        questionResult = {
          id: q.id,
          title: q.title,
          value: values,
          coordinates,
          error: true,
          type: q.type,
        };
      }
      // console.log(q.id, q.title, q.value);
    }
    if (q.type === 'mapLinesMultiple') {
      const coordinates = [];
      const values = [];
      q.lines.forEach((b) => {
        // console.log('b:: ', b);
        if (b.value) {
          values.push(b.value);
          const features = store.state.questionnaireFeatures;
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
      if ((values.length > 0 && coordinates.length > 0) ||
      (q.optional === true || deactivatedQuestions.includes(q.id) ||
      deactivatedPages.includes(q.page))) {
        questionResult = {
          id: q.id,
          title: q.title,
          value: values,
          coordinates,
          error: false,
          type: q.type,
        };
      } else {
        questionResult = {
          id: q.id,
          title: q.title,
          value: values,
          coordinates,
          error: true,
          type: q.type,
        };
      }
      // console.log(q.id, q.title, q.value);
    }
    if (q.type === 'tableOfCheckboxes') {
      // TODO does not check errors now
      questionResult = {
        id: q.id,
        title: q.title,
        value: q.items,
        error: false,
        type: q.type,
      };
    }
    return questionResult;
  }
  getValues(page, deactivatedQuestions, deactivatedPages) {
    const questionnaireResult = [];
    if (page === 'all') {
      this.questionnaire.questions.forEach((q) => {
        const qResult = this.constructor.checkErrorsForQuestion(
          q, deactivatedQuestions, deactivatedPages);
        if (qResult !== null) {
          questionnaireResult.push(qResult);
        }
      });
    } else {
      this.questionnaire.questions.forEach((q) => {
        if (q.page === page) {
          const qResult = this.constructor.checkErrorsForQuestion(
            q, deactivatedQuestions, deactivatedPages);
          if (qResult !== null) {
            questionnaireResult.push(qResult);
          }
        }
      });
    }
    console.log('result:: ', questionnaireResult);
    return questionnaireResult;
  }

  validate(page, deactivatedQuestions, deactivatedPages) {
    let error = false;
    this.getValues(page, deactivatedQuestions, deactivatedPages).forEach((q) => {
      if (q.error) {
        // console.log('there is error in ::: ', q.id);
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
    // console.log('validation result :: ', !error);
    return !error;
  }
}

export default QuestionnaireValidator;
