<template>
  <v-container
    v-if="question.type === 'radioButtonsGroup'"
    class="px-0"
    fluid
    pa-0
    ma-0
  >
    <v-radio-group
      v-model="question.value"
      :row="question.horizontal"
      mandatory
    >
      <v-radio
        v-for="n in question.radios"
        :key="n.id"
        :label="n.label"
        :value="n"
      ></v-radio>
    </v-radio-group>
  </v-container>
</template>
<script>
export default {
  name: "Radiobuttonsgroup",
  props: ["question"]
};
</script>
