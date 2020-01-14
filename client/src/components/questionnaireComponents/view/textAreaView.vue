<template>
  <v-container fluid v-if="question.type === 'textarea'" pa-0 ma-0>
    <v-text-field
      name="input-1"
      v-model="question.value"
      :label="$t('message.yourAnswer')"
    ></v-text-field>
  </v-container>
</template>
<script>
export default {
  name: 'textArea',
  props: ['question'],
};
</script>