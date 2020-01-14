<template>
  <v-container fluid v-if="question.type === 'tableOfInputs'" pa-0 ma-0>
    <table>
    <template v-for="item in question.verticalValues">
      <tr :key="item.id">
        <td>{{ item.title }}</td>
        <td xs1 mr-0 mt-2 pa-0>
          <v-text-field light v-model="item.value"></v-text-field>
        </td>
      </tr>
    </template>
    </table>
    <div v-if='question.showSumMessage'>
      {{ question.messageSum }}
      <span :class="validationClass">{{ sum }}</span> /
      {{ question.sumValidation }}
    </div>
  </v-container>
</template>

<script>
export default {
  name: 'tableofinputs',
  props: ['question'],
  computed: {
    validationClass() {
      let color = 'normal';
      if (this.sum <= this.question.sumValidation) {
        color = 'normal';
      } else {
        color = 'warning';
        this.question.error = true;
      }
      return color;
    },
    sum() {
      let sum = 0;
      this.question.verticalValues.forEach((v) => {
        console.log(sum, v.value);
        sum += Number(v.value);
      });
      return sum;
    },
  },
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