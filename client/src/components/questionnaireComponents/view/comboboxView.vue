<template>
  <v-container fluid v-if="question.type === 'combobox'" pa-0 ma-0>
    <v-select
      v-bind:items="question.items"
      v-model="question.value"
      item-value="value"
      item-text="value"
      :label="$t('message.yourAnswer')"
      single-line
      menu-props="bottom"
      v-on:input="emitToggling()"
    ></v-select>
  </v-container>
</template>
<script>
export default {
  name: 'combobox',
  props: ['question', 'pagehandler'],
  methods: {
    emitToggling() {
      this.$eventHub.$emit('toggleSectionsAndQuestions');
    },
  },
};
</script>