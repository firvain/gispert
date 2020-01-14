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
      v-on:input="pagehandler.toggleSections(); pagehandler.toggleQuestions();"
    ></v-select>
  </v-container>
</template>
<script>
export default {
  name: 'combobox',
  props: ['question', 'pagehandler'],
};
</script>