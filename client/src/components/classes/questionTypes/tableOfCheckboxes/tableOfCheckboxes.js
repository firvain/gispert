class tableOfCheckboxes {
  constructor(question) {
    this.id = question.id;
    this.type = 'tableOfCheckboxes';
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
    if (question.horizontalValues) {
      this.horizontalValues = question.horizontalValues;
    } else {
      this.horizontalValues = [];
    }
    if (!question.verticalValues) {
      this.verticalValues = [];
    } else {
      this.verticalValues = question.verticalValues;
    }
    // this.items = null;
    this.optional = false;
    this.editing = true;
    this.pageBreak = false;
    this.style = {
      titleFontSize: null,
    };
  }
  set page(v) {
    this.page = v;
  }
  get page() {
    return this.page;
  }
  set title(v) {
    this.title = v;
  }
  get title() {
    return this.title;
  }
  set description(v) {
    this.description = v;
  }
  get description() {
    return this.description;
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
  set setItems(items) {
    this.createItems();
  }
  get getItems() {
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
  }
}
export default tableOfCheckboxes;
