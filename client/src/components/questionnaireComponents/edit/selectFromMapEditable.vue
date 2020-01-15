<template>
  <v-flex v-if="question.type === 'mapSelector'">
    <v-text-field
      name="input-1"
      v-model="question.title"
      :label="$t('message.question')"
    ></v-text-field>
    <v-text-field
      name="input-1"
      v-model="question.description"
      :label="$t('message.description')"
    ></v-text-field>
    <v-textarea
      name="input-1"
      v-model="question.mapDataToSelectFrom"
      label="Put a geojson here"
    ></v-textarea>
    <v-checkbox
      :label="$t('message.optional')"
      v-model="question.optional">
    </v-checkbox>
    <v-checkbox
      label="Small caps"
      v-model="question.style.titleFontSize">
    </v-checkbox>
    <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
      <v-icon>folder_open</v-icon>
    </v-btn>
    <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
      <v-icon>delete</v-icon>
    </v-btn>
  </v-flex>
</template>
<script>
export default {
  props: ['question'],
};
</script>