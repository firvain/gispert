<template>
  <v-flex v-if="question.type === 'tableOfInputs'">
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
            @click="question.verticalValues.push({ id: nextItemId, title: '' })"
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
                ></v-text-field>
                <v-icon>delete</v-icon>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
        <v-checkbox
          v-model="question.showSumMessage"
          light
          label="Show sum message"
        >
        </v-checkbox>
        <v-text-field
          v-model="question.messageSum"
          name="input-1"
          label="Message for sum"
        ></v-text-field>
        <v-text-field
          v-model="question.sumValidation"
          name="input-1"
          label="Sum limit"
        ></v-text-field>
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
  </v-flex>
</template>
<script>
export default {
  name: "Tableofinputs",
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
    removeQuestion() {
      this.$eventHub.$emit("removeQuestion", this.question);
    }
  }
};
</script>
