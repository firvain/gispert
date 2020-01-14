<template>
  <v-container fluid v-if="question.type === 'textfield'" pa-0 ma-0>
    <v-text-field
      name="input"
      v-model="question.value"
      :label="$t('message.yourAnswer')"
    ></v-text-field>
  </v-container>
</template>
<script>
export default {
  name: 'textfield',
  props: ['question'],
};
</script>