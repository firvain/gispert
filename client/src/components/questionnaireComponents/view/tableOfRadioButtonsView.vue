<template>
  <v-container v-if="question.type === 'tableOfRadioButtons'" fluid pa-0 ma-0>
    <v-layout row wrap>
      <v-container ma-0 pa-0>
        <v-flex xs12 md12>
          <v-layout
            v-for="(item, index) in question.items"
            :key="item.id"
            row
            wrap
          >
            <v-flex xs3 ma-4>{{ question.verticalValues[index].title }}</v-flex>
            <v-flex xs7>
              <v-radio-group v-model="item.value" row>
                <v-radio
                  v-for="n in item.answers"
                  :key="n.id"
                  :label="n.text"
                  :value="n"
                ></v-radio>
              </v-radio-group>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-container>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Tableofradiobuttons",
  props: ["question"]
};
</script>
