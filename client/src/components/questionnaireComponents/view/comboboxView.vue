<template>
  <v-container v-if="question.type === 'combobox'" fluid pa-0 ma-0>
    <v-select
      v-model="question.value"
      :items="question.items"
      item-value="value"
      item-text="value"
      :label="$t('message.yourAnswer')"
      single-line
      menu-props="bottom"
      @input="emitToggling()"
    ></v-select>
  </v-container>
</template>
<script>
export default {
  name: "Combobox",
  props: ["question", "pagehandler"],
  methods: {
    emitToggling() {
      this.$eventHub.$emit("toggleSectionsAndQuestions");
    }
  }
};
</script>
