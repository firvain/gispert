<template>
  <v-container v-if="question.type === 'textarea'" fluid pa-0 ma-0>
    <v-text-field
      v-model="question.value"
      name="input-1"
      :label="$t('message.yourAnswer')"
    ></v-text-field>
  </v-container>
</template>
<script>
export default {
  name: "TextArea",
  props: ["question"]
};
</script>
