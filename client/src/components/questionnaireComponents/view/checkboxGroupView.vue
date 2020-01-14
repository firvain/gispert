<template>
  <v-container fluid v-if="question.type === 'checkboxGroup'" pa-0 ma-0>
    <v-flex v-for="checkbox in question.checkboxes" :key="checkbox.id">
      <v-checkbox
        :label="checkbox.label"
        v-model="checkbox.value"
        :value="checkbox.value">
      </v-checkbox>
    </v-flex>
  </v-container>
</template>
<script>
export default {
  name: 'checkboxgroup',
  props: ['question'],
  data() {
    return {
      value: null,
    };
  },
};
</script>