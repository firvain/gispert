<template>
<v-flex v-if="question.type === 'radioButtonsGroup'">
    <v-container class="px-0" fluid> {{ question.value }}
      <v-radio-group v-model="question.value" :row='question.horizontal'>
        <v-radio
          v-for="n in question.radios"
          :key="n.id"
          :label="n.label"
          :value="n"
        ></v-radio>
      </v-radio-group>
    </v-container>
    <v-flex>
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
    <v-list>
      <v-btn @click="add">add</v-btn>
      <template v-for="item in question.radios">
        <v-list-tile
            :key="item.id"
        >
          <v-list-tile-content>
            <v-text-field
              name="input-1"
              v-model="item.label"
              append-icon="delete"
              @click:append="question.radios.remove(item)"
            ></v-text-field>
            <v-icon>delete</v-icon>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list>
    <v-checkbox
      label="Horizontal"
      v-model="question.horizontal">
    </v-checkbox>
    <v-checkbox
      label="Optional"
      v-model="question.optional">
    </v-checkbox>
    <v-checkbox
      label="Small caps"
      v-model="question.style.titleFontSize">
    </v-checkbox>
    <v-btn flat outlined fab small @click="question.editing = !question.editing" v-if="question.editing">
      <v-icon>folder_open</v-icon>
    </v-btn>
    <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
      <v-icon>delete</v-icon>
    </v-btn>
  </v-flex>      
</v-flex>
</template>
<script>
export default {
  props: ['question'],
  methods: {
    add() {
      this.question.radios.push(
        { id: `i${this.nextItemId}`, label: '...' },
      );
    },
    removeQuestion() {
      this.$eventHub.$emit('removeQuestion', this.question);
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
};
</script>