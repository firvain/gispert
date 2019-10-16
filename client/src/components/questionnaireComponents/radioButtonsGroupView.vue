<template>
    <v-container class="px-0" fluid pa-0 ma-0>
      <v-radio-group v-model="question.value" :row='question.horizontal'>
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
  props: ['question'],
  // watch: {
  //   'question.value': (e) => {
  //     console.log('value changed');
  //     e.error = true;
  //     // this.makeValid();
  //   },
  // },
  // methods: {
  //   makeValid() {
  //     console.log('making valid');
  //     this.question.error = false;
  //   },
  // },
};
</script>