<template>
    <v-container class="px-0" v-if="question.type === 'radioButtonsGroup'" fluid pa-0 ma-0>
      <v-radio-group v-model="question.value" :row='question.horizontal' mandatory>
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
  name: 'radiobuttonsgroup',
  props: ['question'],
};
</script>