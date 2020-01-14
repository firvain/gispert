<template>
  <v-container fluid v-if="question.type === 'mapLinesMultiple'" pa-0 ma-0>
    <v-layout row wrap v-for="line in question.lines" :key="line.id">
      <v-flex xs10>
        <v-text-field
          name="input-1"
          v-model="line.value"
          :label="$t('message.yourAnswer')"
        ></v-text-field>
      </v-flex>
      <v-flex xs2>
        <v-btn small fab dark class="indigo"
          @click="getFromMap(line.id, 'LineString', line.value, line.style);
          $store.commit('setDrawMessage', '<code>Διπλό κλικ για ολοκλήρωση σχεδίασης,<br>Delete για διαγραφή τελευταίου σημείου</code>');">
          <v-icon dark>timeline</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-btn dark class="indigo" @click="addRow(question)">
      {{ $t('message.addLine')}}
    </v-btn>
  </v-container>
</template>
<script>
import olMap from '../../../js/map';

export default {
  name: 'maplinestringmultiple',
  props: ['question'],
  methods: {
    getFromMap(id, type, title, style) {
      olMap.removeFeaturesFromLayer('customLayer', 'buttonId', [id]);
      this.$store.commit('setQuestionnaireFeatureId', id);
      const featureStyle = {
        strkWdth: style.strkWdth,
        strkClr: style.strkClr,
        fllClr: style.fllClr,
        radius: style.radius,
        messages: title,
      };
      this.$store.commit('setDrawnFeatureStyle', featureStyle);
      this.$store.commit('setMapState', 'mapAvailable');
      olMap.setActiveInteraction(type);
    },
    addRow(question) {
      if (question.lines.length < 21) {
        question.lines.push({
          id: `${question.id}${question.lines.length + 1}`,
          value: null,
          coords: [],
          style: {
            strkWdth: 2,
            strkClr: 'blue',
            fllClr: 'orange',
          },
        });
      }
    },
  },
};
</script>