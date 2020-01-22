<template>
  <v-flex v-if="question.type === 'radioButtonsGroup'">
    <v-container class="px-0" fluid>
      {{ question.value }}
      <v-radio-group v-model="question.value" :row="question.horizontal">
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
        v-model="question.title"
        name="input-2"
        :label="$t('message.question')"
      ></v-text-field>
      <v-text-field
        v-model="question.description"
        name="input-2"
        :label="$t('message.description')"
      ></v-text-field>
      <v-list>
        <v-btn @click="add">add</v-btn>
        <template v-for="item in question.radios">
          <v-list-tile :key="item.id">
            <v-list-tile-content>
              <v-text-field
                v-model="item.label"
                name="input-1"
                append-icon="delete"
                @click:append="question.radios.remove(item)"
              ></v-text-field>
              <v-icon>delete</v-icon>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
      <v-checkbox v-model="question.horizontal" label="Horizontal">
      </v-checkbox>
      <v-checkbox v-model="question.optional" label="Optional"> </v-checkbox>
      <v-checkbox v-model="question.style.titleFontSize" label="Small caps">
      </v-checkbox>
      <v-btn
        v-if="question.editing"
        text
        outlined
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
  </v-flex>
</template>
<script>
export default {
  props: {
    question: {
      type: Object,
      required: true
    }
  },
  computed: {
    nextId: {
      cache: false,
      get() {
        return String(Date.now()) + Math.floor(Math.random() * 10000);
      }
    },
    nextItemId: {
      cache: false,
      get() {
        return String(Date.now()) + Math.floor(Math.random() * 10000);
      }
    }
  },
  methods: {
    add() {
      this.question.radios.push({ id: `i${this.nextItemId}`, label: "..." });
    },
    removeQuestion() {
      this.$eventHub.$emit("removeQuestion", this.question);
    }
  }
};
</script>
