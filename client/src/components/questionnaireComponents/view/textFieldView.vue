<template>
  <v-container v-if="question.type === 'textfield'" fluid pa-0 ma-0>
    <v-text-field
      v-model="question.value"
      name="input"
      :label="$t('message.yourAnswer')"
    ></v-text-field>
  </v-container>
</template>
<script>
export default {
  name: "Textfield",
  props: ["question"]
};
</script>
