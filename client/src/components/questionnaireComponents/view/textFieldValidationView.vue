<template>
  <v-container fluid pa-0 ma-0 v-if="question.type === 'textfieldvalidation'">
    <v-text-field
      name="input-2"
      v-model="question.value"
      :label="$t('message.yourAnswer')"
      :rules="rules"
    ></v-text-field>
  </v-container>
</template>
<script>
export default {
  name: 'textfieldValidation',
  props: ['question'],
  data() {
    return {
      rules: [],
    };
  },
  created() {
    // console.log('this is the validation string:: ', this.question);
    if (this.question.validation && this.question.validation === 'email') {
      console.log('this is email');
      this.rules = [
        v => !!v || 'E-mail is required',
        v => /[^@]+@[^.]+\..*/.test(v) || 'E-mail must be valid',
      ];
    } else if (this.question.validation && this.question.validation.length > 3) {
      // console.log('this is number::', this.question.validation,
      // typeof (this.question.validation));
      const validation = JSON.parse(this.question.validation);
      if (validation) {
        if (validation.type === 'number' && !validation.min && !validation.max) {
          // console.log('this is the validation string:: ', validation);
          this.rules = [
            v => !isNaN(v) || 'Value must be number',
            v => !!v || 'Value is not number',
          ];
        }
        if (validation.type === 'number' && validation.min && !validation.max) {
          // console.log('this is the validation string:: ', validation);
          this.rules = [
            v => !isNaN(v) || 'Value must be number',
            v => !!v || 'Value is not number',
            v => Number(v) > Number(validation.min) || 'Value must be in range',
          ];
        }
        if (validation.type === 'number' && !validation.min && validation.max) {
          // console.log('this is the validation string:: ', validation);
          this.rules = [
            v => !isNaN(v) || 'Value must be number',
            v => !!v || 'Value is not number',
            v => Number(v) < Number(validation.max) || 'Value must be in range',
          ];
        }
        if (validation.type === 'number' && validation.min && validation.max) {
          // console.log('this is the validation string:: ', validation);
          this.rules = [
            v => !isNaN(v) || 'Value must be number',
            v => !!v || 'Value is not number',
            v => Number(v) > Number(validation.min) || 'Value must be in range',
            v => Number(v) < Number(validation.max) || 'Value must be in range',
          ];
        }
      }
    }
  },
};
</script>