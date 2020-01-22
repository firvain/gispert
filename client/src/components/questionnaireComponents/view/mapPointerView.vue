<template>
  <v-container v-if="question.type === 'mapPointer'" fluid pa-0 ma-0>
    <v-flex v-for="button in question.buttons" :key="button.id"
      >{{ button.label }}
      <v-btn
        small
        fab
        dark
        :color="button.style.strkClr"
        @click="
          getFromMap(button.id, 'Point', button.label, button.style);
          $store.commit(
            'setDrawMessage',
            '<code>Κάντε κλικ στο σημείο της απάντησής σας</code>'
          );
        "
      >
        <v-icon dark>location_on</v-icon>
      </v-btn>
    </v-flex>
  </v-container>
</template>
<script>
import olMap from "../../../js/map";

export default {
  name: "Mappointer",
  props: ["question"],
  methods: {
    getFromMap(id, type, title, style) {
      olMap.removeFeaturesFromLayer("customLayer", "buttonId", [id]);
      this.$store.commit("setQuestionnaireFeatureId", id);
      const featureStyle = {
        strkWdth: style.strkWdth,
        strkClr: style.strkClr,
        fllClr: style.fllClr,
        radius: style.radius,
        messages: title
      };
      this.$store.commit("setDrawnFeatureStyle", featureStyle);
      this.$store.commit("setMapState", "mapAvailable");
      olMap.setActiveInteraction(type);
    }
  }
};
</script>
