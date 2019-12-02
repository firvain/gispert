<template>
  <v-container fluid v-if="question.type === 'tableOfCheckboxes'" pa-0 ma-0>
    <table>
    <tr>
      <template v-for="header in [{text: '', id: '0'}].concat(question.horizontalValues)">
      <td :key="header.id" class='rotatedText' align="center">
        {{header.text}}
      </td>
      </template>
    </tr>
    <template v-for="item in question.items">
      <tr :key="item.id">
        <td>{{ item.title }}</td>
        <td xs1 mr-0 mt-2 pa-0 v-for="answer in item.answers" :key="answer.id">
          <v-checkbox light v-model="answer.selected"></v-checkbox>
        </td>
      </tr>
    </template>
    </table>
  </v-container>
</template>

<script>
export default {
  props: ['question'],
};
</script>
<style scoped>
  .rotatedText {
  -ms-writing-mode: tb-rl;
  -webkit-writing-mode: vertical-rl;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  padding: 1em;
  font-weight: bold;
}
tr:nth-child(even) {background-color: #f2f2f2;}
</style>