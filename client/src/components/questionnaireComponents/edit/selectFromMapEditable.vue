<template>
  <v-flex v-if="question.type === 'mapSelector'">
    <v-text-field
      v-model="question.title"
      name="input-1"
      :label="$t('message.question')"
    ></v-text-field>
    <v-text-field
      v-model="question.description"
      name="input-1"
      :label="$t('message.description')"
    ></v-text-field>
    <v-textarea
      v-model="question.mapDataToSelectFrom"
      name="input-1"
      label="Put a geojson here"
    ></v-textarea>
    <v-checkbox v-model="question.optional" :label="$t('message.optional')">
    </v-checkbox>
    <v-checkbox v-model="question.style.titleFontSize" label="Small caps">
    </v-checkbox>
    <v-btn
      v-if="question.editing"
      text
      outline
      fab
      small
      @click="question.editing = !question.editing"
    >
      <v-icon>folder_open</v-icon>
    </v-btn>
    <v-btn
      v-if="question.editing"
      text
      outline
      fab
      small
      @click="removeQuestion(question)"
    >
      <v-icon>delete</v-icon>
    </v-btn>
  </v-flex>
</template>
<script>
export default {
  props: { question: { type: Object, required: true } }
};
</script>
