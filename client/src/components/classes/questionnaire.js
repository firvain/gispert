class tableOfCheckboxes {
  constructor(id) {
    this.id = id;
    this.type = 'tableOfCheckboxes';
    this.page = 0;
    this.title = null;
    this.description = null;
    this.error = false;
    this.horizontalValues = [];
    this.verticalValues = [];
    // this.items = null;
    this.optional = false;
    this.editing = true;
    this.pageBreak = false;
    this.style = {
      titleFontSize: null,
    };
  }
  set addHorizontalValue(v) {
    this.horizontalValues.push(v);
  }
  set removeHorizontalValue(v) {
    this.horizontalValues.remove(v);
  }

  set addVerticalValue(v) {
    this.verticalValues.push(v);
  }
  set removeVerticalValue(v) {
    this.verticalValues.remove(v);
  }
  get horizontal() {
    return this.horizontalValues;
  }
  get vertical() {
    return this.verticalValues;
  }

  get items() {
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
    // this.items = items;
    return items;
  }
}
export default tableOfCheckboxes;
