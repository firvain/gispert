<template>
  <v-container fluid v-if="question.type === 'textfieldvalidation' && question.validation === 'email'" pa-0 ma-0>
    <v-text-field
      name="input-2"
      v-model="question.value"
      :label="$t('message.yourAnswer')"
      :rules="emailRules"
    ></v-text-field>
  </v-container>
</template>
<script>
export default {
  name: 'textfieldValidation',
  props: ['question'],
  data() {
    return {
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /[^@]+@[^.]+\..*/.test(v) || 'E-mail must be valid',
      ],
    };
  },
};
</script>