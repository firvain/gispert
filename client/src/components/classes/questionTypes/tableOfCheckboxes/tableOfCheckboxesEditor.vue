<template>
    <div>
      <v-text-field
        name="input-2"
        v-model="questionData.title"
        :label="$t('message.question')"
      ></v-text-field>
      <v-text-field
        name="input-2"
        v-model="questionData.description"
        :label="$t('message.description')"
      ></v-text-field>
      <v-layout>
        <v-flex xs6>Vertical values
          <v-list>
            <v-btn flat outline fab small
              @click="questionData.addVerticalValue = { id: nextItemId, title: '' };"
              v-if="questionData.editing">
              <v-icon>add</v-icon>
            </v-btn>
            <template v-for="item in questionData.vertical">
              <v-list-tile
                  :key="item.id"
              >
                <v-list-tile-content>
                  <v-text-field
                    name="input-1"
                    v-model="item.title"
                    append-icon="delete"
                    @click:append="questionData.removeVerticalValue = item;"
                  ></v-text-field>
                  <v-icon>delete</v-icon>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-flex>
        <v-flex xs6>Horizontal values
          <v-list>
            <v-btn flat outline fab small @click="questionData.addHorizontalValue = { id: nextItemId, text: '', selected: false };"
              v-if="questionData.editing">
              <v-icon>add</v-icon>
            </v-btn>
            <template v-for="answer in questionData.horizontal">
              <v-list-tile
                  :key="answer.id"
              >
                <v-list-tile-content>
                  <v-text-field
                    name="input-1"
                    v-model="answer.text"
                    append-icon="delete"
                    @click:append="questionData.removeHorizontalValues = item;"
                  ></v-text-field>
                  <v-icon>delete</v-icon>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-flex>
      </v-layout>
      <v-checkbox
        :label="$t('message.optional')"
        v-model="questionData.optional">
      </v-checkbox>
      <v-btn flat outline fab small @click="questionData.editing = !questionData.editing" v-if="questionData.editing">
        <v-icon>folder_open</v-icon>
      </v-btn>
      <!-- <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
        <v-icon>delete</v-icon>
      </v-btn> -->
      {{ questionData }}
    </div>
</template>
<script>
// import TableOfCheckboxes from './tableOfCheckboxes';
class TableOfCheckboxes {
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
  // set page(v) {
  //   this.page = v;
  // }
  // get page() {
  //   return this.page;
  // }
  // set title(v) {
  //   this.title = v;
  // }
  // get title() {
  //   return this.title;
  // }
  // set description(v) {
  //   this.description = v;
  // }
  // get description() {
  //   return this.description;
  // }

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

export default {
  props: ['question'],
  components: {
    TableOfCheckboxes,
  },
  data() {
    return {
      questionData: undefined,
    };
  },
  watch: {
    question() {
      this.$emit('input', this.questionData);
    },
  },
  computed: {
    nextId: {
      cache: false,
      get() {
        return String(Date.now()) + Math.floor(Math.random() * 10000);
      },
    },
    nextItemId: {
      cache: false,
      get() {
        return String(Date.now()) + Math.floor(Math.random() * 10000);
      },
    },
  },
  mounted() {
    console.log(this.question, ' to load in class');
    this.questionData = new TableOfCheckboxes(this.question);
  },
};
</script>
