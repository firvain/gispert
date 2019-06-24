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

class PageHandler {
  constructor(q) {
    this.questionnaire = q;
    this.totalPages = 0;
    this.pagesQueue = null;
    this.currentPage = 0;
    this.deactivatedPages = [];
    this.showSubmit = false;
    this.showNext = true;
    this.showPrevious = false;
    this.init();
  }
  labels() {
    return `${this.currentPage + 1} / ${Object.keys(this.pagesQueue).length - this.deactivatedPages.length}`;
  }
  init() {
    this.findTotalPages();
    this.toggleSections();
  }
  set page(v) {
    this.currentPage = v;
  }
  get page() {
    return this.currentPage;
  }
  get buttons() {
    const buttons = {
      next: this.showNext,
      previous: this.showPrevious,
      submit: this.showSubmit,
    };
    return buttons;
  }
  findTotalPages() {
    let pageCount = 0;
    this.questionnaire.questions.forEach((q) => {
      if (q.page >= pageCount) {
        pageCount = q.page;
      }
    });
    this.totalPages = pageCount - this.deactivatedPages.length;
  }
  pageVisibility(v) {
    // console.log('page visibility for :: ', v);
    return this.pagesQueue[v].visibility;
  }
  goToPreviousPage() {
    // console.log('going to previous page');
    for (let i = this.currentPage - 1; i >= 0; i -= 1) {
      // console.log('checking page:: ', i, this.pagesQueue[i]);
      if (i === 0) {
        // console.log('i = first page');
        this.showSubmit = false;
        this.showNext = true;
        this.showPrevious = false;
      }
      if (i > 0 && i < Object.keys(this.pagesQueue).length - 1) {
        // console.log('i smaller than last page');
        this.showSubmit = false;
        this.showNext = true;
        this.showPrevious = true;
      }
      if (this.pagesQueue[i].visibility) {
        this.currentPage = i;
        break;
      }
    }
  }
  goToNextPage() {
    for (
      let i = this.currentPage + 1;
      i < Object.keys(this.pagesQueue).length;
      i += 1
    ) {
      if (i === Object.keys(this.pagesQueue).length - 1) {
        this.showSubmit = true;
        this.showNext = false;
      }
      if (i < Object.keys(this.pagesQueue).length - 1) {
        this.showNext = true;
      }
      if (i > 0 && i <= Object.keys(this.pagesQueue).length) {
        this.showPrevious = true;
      }
      // console.log(i);
      if (this.pagesQueue[i].visibility) {
        this.currentPage = i;
        break;
      }
    }
  }
  toggleSections() {
    console.log('toggling sections');
    const pagesToAdd = [];
    const pagesToRemove = [];
    // console.log(selected);
    this.deactivatedPages = [];
    this.questionnaire.questions.forEach((question) => {
      // for each question check if has value
      if (
        question.type === 'combobox' &&
        (question.value || question.optional === true)
      ) {
        console.log('found combobox with value or optional:: ', question);
        question.items.forEach((item) => {
          if (
            item.activatePages &&
            item.activatePages[0] !== '-' &&
            question.value === item.value
          ) {
            console.log('found item active to remove page from deactivated');
            item.activatePages.forEach((i) => {
              pagesToRemove.push(i);
            });
          }
          if (
            item.activatePages &&
            item.activatePages[0] !== '-' &&
            question.value !== item.value
          ) {
            console.log('found item active to add page to deactivated');
            item.activatePages.forEach((i) => {
              pagesToAdd.push(i);
            });
          }
        });
      }
      if (question.type === 'combobox' && !question.value) {
        question.items.forEach((item) => {
          if (item.activatePages && item.activatePages[0] !== '-') {
            // console.log('found combobox without value:: ', question);
            item.activatePages.forEach((i) => {
              pagesToAdd.push(i);
            });
          }
        });
      }
    });
    // console.log(pagesToAdd, pagesToRemove);
    this.deactivatedPages = pagesToAdd.filter(p => !pagesToRemove.includes(p));
    const pagesQueue = {};
    for (let index = 0; index <= this.totalPages; index += 1) {
      // console.log(this.deactivatedPages);
      if (this.deactivatedPages.includes(index)) {
        // console.log('false');
        pagesQueue[`${index}`] = { visibility: false };
      } else {
        // console.log('true');
        pagesQueue[`${index}`] = { visibility: true };
      }
    }
    this.pagesQueue = pagesQueue;
  }
}
export { tableOfCheckboxes, PageHandler };
