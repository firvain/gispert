<template>
  <v-flex v-if="question.type === 'tableOfInputs'">
    <v-text-field
      name="input-2"
      v-model="question.title"
      :label="$t('message.question')"
    ></v-text-field>
    <v-text-field
      name="input-2"
      v-model="question.description"
      :label="$t('message.description')"
    ></v-text-field>
    <v-layout>
      <v-flex xs6>Vertical values
        <v-list>
          <v-btn flat outline fab small
            @click="question.verticalValues.push({ id: nextItemId, title: '' });"
            v-if="question.editing">
            <v-icon>add</v-icon>
          </v-btn>
          <template v-for="item in question.verticalValues">
            <v-list-tile
                :key="item.id"
            >
              <v-list-tile-content>
                <v-text-field
                  name="input-1"
                  v-model="item.title"
                  append-icon="delete"
                  @click:append="question.verticalValues.remove(item);"
                ></v-text-field>
                <v-icon>delete</v-icon>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
        <v-checkbox
          light
          label='Show sum message'
          v-model="question.showSumMessage">
        </v-checkbox>
        <v-text-field
          name="input-1"
          v-model="question.messageSum"
          label='Message for sum'
        ></v-text-field>
        <v-text-field
          name="input-1"
          v-model="question.sumValidation"
          label='Sum limit'
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-checkbox
      :label="$t('message.optional')"
      v-model="question.optional">
    </v-checkbox>
    <v-checkbox
      label="Small caps"
      v-model="question.style.titleFontSize">
    </v-checkbox>
    <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
      <v-icon>folder_open</v-icon>
    </v-btn>
    <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
      <v-icon>delete</v-icon>
    </v-btn>
  </v-flex>
</template>
<script>
export default {
  name: 'tableofinputs',
  props: ['question'],
  computed: {
    nextItemId: {
      cache: false,
      get() {
        return String(Date.now()) + Math.floor(Math.random() * 10000);
      },
    },
  },
  methods: {
    removeQuestion() {
      this.$eventHub.$emit('removeQuestion', this.question);
    },
  },
};
</script>
