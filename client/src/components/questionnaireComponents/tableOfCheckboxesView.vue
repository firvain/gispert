<template>
  <v-container fluid v-if="question.type === 'tableOfCheckboxes'" pa-0 ma-0>
    <v-layout row wrap>
      <v-container ma-0 pa-0>
        <v-flex xs12 md12>
            <v-layout row wrap>
                <v-flex xs1>
                </v-flex>
                <v-flex xs1 ma-0 pa-0 v-for="answer in question.horizontalValues" :key="answer.id">
                  <div class='rotatedText'>{{ answer.text }}</div>
                </v-flex>
            </v-layout>
        </v-flex>
        <v-flex xs12 md12>
          <v-layout row wrap v-for="item in question.items" :key="item.id">
            <v-flex xs1 mr-4>{{ item.title }}</v-flex>
            <v-flex xs1 ma-0 pa-0 v-for="answer in item.answers" :key="answer.id">
              <v-checkbox light v-model="answer.selected"></v-checkbox>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-container>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  props: ['question'],
};
</script>
<style scoped>
  .rotatedText {
    -ms-transform: rotate(-90deg); /* IE 9 */
    -webkit-transform: rotate(-90deg); /* Safari 3-8 */
    transform: rotate(-90deg);
  }
</style>