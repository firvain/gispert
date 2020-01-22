<template>
  <v-flex v-if="question.type === 'tableOfRadioButtons'">
    <v-text-field
      v-model="question.title"
      name="input-2"
      :label="$t('message.question')"
    ></v-text-field>
    <v-text-field
      v-model="question.description"
      name="input-2"
      :label="$t('message.description')"
    ></v-text-field>
    <v-layout>
      <v-flex xs6
        >Vertical values
        <v-list>
          <v-btn
            v-if="question.editing"
            text
            outline
            fab
            small
            @click="
              question.verticalValues.push({ id: nextItemId, title: '' });
              createItems();
            "
          >
            <v-icon>add</v-icon>
          </v-btn>
          <template v-for="item in question.verticalValues">
            <v-list-tile :key="item.id">
              <v-list-tile-content>
                <v-text-field
                  v-model="item.title"
                  name="input-1"
                  append-icon="delete"
                  @click:append="question.verticalValues.remove(item)"
                  @change="createItems()"
                ></v-text-field>
                <v-icon>delete</v-icon>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </v-flex>
      <v-flex xs6
        >Horizontal values
        <v-list>
          <v-btn
            v-if="question.editing"
            text
            outline
            fab
            small
            @click="
              question.horizontalValues.push({ id: nextItemId, text: '' })
            "
          >
            <v-icon>add</v-icon>
          </v-btn>
          <template v-for="answer in question.horizontalValues">
            <v-list-tile :key="answer.id">
              <v-list-tile-content>
                <v-text-field
                  v-model="answer.text"
                  name="input-1"
                  append-icon="delete"
                  @click:append="question.horizontalValues.remove(answer)"
                  @change="createItems()"
                ></v-text-field>
                <v-icon>delete</v-icon>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </v-flex>
    </v-layout>
    <v-checkbox v-model="question.optional" :label="$t('message.optional')">
    </v-checkbox>
    <v-checkbox v-model="question.style.titleFontSize" label="Small caps">
    </v-checkbox>
    <v-btn
      v-if="question.editing"
      text
      outline
      fab
      small
      @click="question.editing = !question.editing"
    >
      <v-icon>folder_open</v-icon>
    </v-btn>
    <v-btn
      v-if="question.editing"
      text
      outline
      fab
      small
      @click="removeQuestion(question)"
    >
      <v-icon>delete</v-icon>
    </v-btn>
    <v-btn text outline fab small @click="createItems()">
      <v-icon>cached</v-icon>
    </v-btn>
  </v-flex>
</template>
<script>
export default {
  props: { question: { type: Object, required: true } },
  computed: {
    nextItemId: {
      cache: false,
      get() {
        return String(Date.now()) + Math.floor(Math.random() * 10000);
      }
    }
  },
  methods: {
    createItems() {
      const items = [];
      if (this.question.horizontalValues && this.question.verticalValues) {
        this.question.verticalValues.forEach(vv => {
          const answers = [];
          this.question.horizontalValues.forEach(hv => {
            answers.push({ id: `${hv.id}_${vv.id}`, text: hv.text });
          });
          items.push({ id: vv.id, title: vv.title, answers, value: null });
        });
      }
      console.log(items);
      this.question.items = items;
      // return items;
    },
    removeQuestion() {
      this.$eventHub.$emit("removeQuestion", this.question);
    }
  }
};
</script>
