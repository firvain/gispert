<template>
  <v-container v-if="question.type === 'tableOfCheckboxes'" fluid pa-0 ma-0>
    <table>
      <tr>
        <template
          v-for="header in [{ text: '', id: '0' }].concat(
            question.horizontalValues
          )"
        >
          <td :key="header.id" class="rotatedText" height="100">
            {{ header.text }}
          </td>
        </template>
      </tr>
      <template v-for="item in question.items">
        <tr :key="item.id">
          <td>{{ item.title }}</td>
          <td
            v-for="answer in item.answers"
            :key="answer.id"
            xs1
            mr-0
            mt-2
            pa-0
          >
            <v-checkbox v-model="answer.selected" light></v-checkbox>
          </td>
        </tr>
      </template>
    </table>
  </v-container>
</template>

<script>
export default {
  name: "Tableofcheckboxes",
  props: ["question"]
};
</script>
<style scoped>
.rotatedText {
  -ms-writing-mode: tb-rl;
  -webkit-writing-mode: vertical-rl;
  writing-mode: vertical-rl;
  transform: rotate(270deg);
  /* white-space: nowrap; */
  /* padding: 1em; */
  font-weight: bold;
  text-align: top;
}
tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
