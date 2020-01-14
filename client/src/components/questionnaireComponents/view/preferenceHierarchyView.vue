<template>
  <v-container fluid v-if="question.type === 'preferenceHierarchy'" pa-0 ma-0>
    <v-list one-line>
      <draggable v-model="question.optionsToSort" @start="drag=true" @end="drag=false">
        <template v-for='element in question.optionsToSort'>
          <v-list-tile :key="element.id" avatar class='force-hover'>
            <v-list-tile-avatar>
              <v-icon>drag_indicator</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title v-html="element.label"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </draggable>
    </v-list>
  </v-container>
</template>
<script>
import draggable from 'vuedraggable';

export default {
  name: 'preferencehierarchy',
  props: ['question', 'pagehandler'],
  components: {
    draggable,
  },
};
</script>