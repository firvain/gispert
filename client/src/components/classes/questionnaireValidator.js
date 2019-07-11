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
    /* eslint-disable no-param-reassign */
    const geojsonFormat = new ol.format.GeoJSON();
    let questionResult = null;
    console.log('checking :: ', q);

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
        q.error = true;
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
        q.error = true;
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
        q.error = true;
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
        q.error = true;
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
        // console.log('features :: ', features, b.id);
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
      // console.log('coordinates :: ', coordinates);
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
        q.error = true;
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
        q.error = true;
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
        q.error = true;
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
        q.error = true;
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
    if (q.type === 'mapPointsLinesMultiple') {
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
        q.error = true;
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
    // if (q.type === 'repeatable' && q.questions && q.questions.length > 0) {
    //   const repeatableResult = [];
    //   q.questions.forEach((a) => {
    //     if (a.type !== 'repeatable') {
    //       repeatableResult.push(
    //         this.checkErrorsInRepeatableQuestion(
    //           a, deactivatedQuestions, deactivatedPages).error,
    //       );
    //     }
    //   });
    //   if (!repeatableResult.includes(true)) {
    //     questionResult = {
    //       id: q.id,
    //       title: q.title,
    //       questions: q.questions,
    //       error: false,
    //       type: q.type,
    //     };
    //   } else {
    //     questionResult = {
    //       id: q.id,
    //       title: q.title,
    //       questions: q.questions,
    //       error: true,
    //       type: q.type,
    //     };
    //   }
    // }
    console.log('question result :: ', questionResult);
    if (questionResult.error) {
      q.error = true;
    } else {
      q.error = false;
    }
    /* eslint-enable no-param-reassign */
    return questionResult;
  }
  getValues(page, deactivatedQuestions, deactivatedPages) {
    const questionnaireResult = [];
    if (page === 'all') {
      this.questionnaire.questions.forEach((q) => {
        if (q.type !== 'titleDescription') {
          if (q.type === 'repeatable' && q.questions && q.questions.length > 0) {
            q.questions.forEach((qu) => {
              const qResult = this.constructor.checkErrorsForQuestion(
                qu, deactivatedQuestions, deactivatedPages);
              if (qResult !== null) {
                qResult.parentId = q.id;
                questionnaireResult.push(qResult);
              }
            });
          } else {
            const qResult = this.constructor.checkErrorsForQuestion(
              q, deactivatedQuestions, deactivatedPages);
            if (qResult !== null) {
              questionnaireResult.push(qResult);
            }
          }
        }
      });
    } else {
      this.questionnaire.questions.forEach((q) => {
        if (q.page === page) {
          if (q.type !== 'titleDescription') {
            if (q.type === 'repeatable' && q.questions && q.questions.length > 0) {
              q.questions.forEach((qu) => {
                const qResult = this.constructor.checkErrorsForQuestion(
                  qu, deactivatedQuestions, deactivatedPages);
                if (qResult !== null) {
                  questionnaireResult.push(qResult);
                }
              });
            } else {
              const qResult = this.constructor.checkErrorsForQuestion(
                q, deactivatedQuestions, deactivatedPages);
              if (qResult !== null) {
                questionnaireResult.push(qResult);
              }
            }
          }
        }
      });
    }
    // console.log('result:: ', questionnaireResult);
    return questionnaireResult;
  }

  validate(page, deactivatedQuestions, deactivatedPages) {
    const errors = [];
    let error = false;
    this.getValues(page, deactivatedQuestions, deactivatedPages).forEach((q) => {
      errors.push(q.error);
      // if (q.error) {
        // console.log('there is error in ::: ', q.id);
        // const objIndex =
        //   this.questionnaire.questions.findIndex((obj => obj.id === q.id));
        // if (objIndex) {
        //   this.questionnaire.questions[objIndex].error
        //     = true; // eslint-disable-line no-param-reassign
        // error = true;
        // }
      // } else {
      //   error = false;
        // const objIndex =
        //   this.questionnaire.questions.findIndex((obj => obj.id === q.id));
        // if (objIndex) {
        //   this.questionnaire.questions[objIndex].error
        //     = false; // eslint-disable-line no-param-reassign
        // }
    //   }
    });
    // console.log('validation result :: ', !error);
    if (errors.includes(true)) { error = true; }
    return !error;
  }
}

export default QuestionnaireValidator;
