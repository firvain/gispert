class tableOfCheckboxes {
  constructor(question) {
    this.id = question.id;
    this.type = 'tableOfCheckboxes';
    if (!question.horizontalValues) {
      this.horizontalValues = [];
    } else {
      this.horizontalValues = question.horizontalValues;
    }
    if (!question.verticalValues) {
      this.verticalValues = [];
    } else {
      this.verticalValues = question.verticalValues;
    }
    if (!question.items) {
      this.items = [];
    } else {
      this.items = question.items;
    }
    if (!question.page) {
      this.page = 0;
    } else {
      this.page = question.page;
    }
    if (!question.title) {
      this.title = null;
    } else {
      this.title = question.title;
    }
    if (!question.description) {
      this.description = null;
    } else {
      this.description = question.description;
    }
    if (!question.error) {
      this.error = false;
    } else {
      this.error = question.error;
    }
    if (!question.optional) {
      this.optional = false;
    } else {
      this.optional = question.optional;
    }
    if (!question.editing) {
      this.editing = true;
    } else {
      this.editing = question.editing;
    }
    if (!question.pageBreak) {
      this.pageBreak = false;
    } else {
      this.pageBreak = question.pageBreak;
    }
    if (!question.style) {
      this.style = {
        titleFontSize: null,
      };
    } else {
      this.style = question.style;
    }
  }
  set addHorizontalValue(v) {
    this.horizontalValues.push(v);
    this.createItems();
  }
  set removeHorizontalValue(v) {
    this.horizontalValues.remove(v);
    this.createItems();
  }
  set addVerticalValue(v) {
    this.verticalValues.push(v);
    this.createItems();
  }
  set removeVerticalValue(v) {
    this.verticalValues.remove(v);
    this.createItems();
  }
  get horizontal() {
    return this.horizontalValues;
  }
  get vertical() {
    return this.verticalValues;
  }
  get items() {
    return this.items;
  }
  createItems() {
    const items = [];
    if (this.horizontalValues && this.verticalValues) {
      this.verticalValues.forEach((vv) => {
        const answers = [];
        this.horizontalValues.forEach((hv) => {
          answers.push({ id: `${hv.id}_${vv.id}`, text: hv.text, selected: hv.selected });
        });
        items.push({ id: vv.id, title: vv.title, answers });
      });
    }
    this.items = items;
    // return items;
  }
}
export default tableOfCheckboxes;
