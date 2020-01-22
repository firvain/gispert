<template>
  <v-container v-if="question.type === 'checkboxGroup'" fluid pa-0 ma-0>
    <v-flex v-for="checkbox in question.checkboxes" :key="checkbox.id">
      <v-checkbox
        v-model="checkbox.value"
        :label="checkbox.label"
        :value="checkbox.value"
      >
      </v-checkbox>
    </v-flex>
  </v-container>
</template>
<script>
export default {
  name: "Checkboxgroup",
  props: ["question"],
  data() {
    return {
      value: null
    };
  }
};
</script>
