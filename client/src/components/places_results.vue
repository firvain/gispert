<template>
  <v-card class='overflowing'>
    {{ results.display_name }}
    <v-list two-line subheader>
      <v-list-tile avatar v-for="item in results" v-bind:key="item.display_name">
        <v-list-tile-avatar>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>{{ item.display_name }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ item.display_name }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn icon ripple>
            <v-icon color="grey lighten-1">info</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
  </v-card>
</template>
<script>
export default {
  props: ['results'],
};
</script>
<style>
.overflowing {
  z-index: 9999999;
}
</style>
