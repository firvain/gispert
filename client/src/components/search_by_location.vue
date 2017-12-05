<template>
  <div id='searchByLocation'>
    <v-container fluid v-if="mode === 0">
    </v-container>
  </div>
</template>
<script>
import timeline from './timeline';

export default {
  name: 'searchByLocation',
  data: () => ({
    mode: 0,
    e1: 0,
  }),
  components: {
    timeline,
  },
  methods: {
    addCustomBoundary() {
      // alert('asldkfjlas');
      // select.getFeatures().clear();
      // customLayer.getSource().clear();
      // var map_view_extent = map.getView().calculateExtent(map.getSize());
      // var map_view_center_x = (map_view_extent[0] + map_view_extent[2])/2;
      // var map_view_center_y = (map_view_extent[1] + map_view_extent[3])/2;
      // var custom_boundary_extent1 = new ol.extent.boundingExtent([
      // [map_view_center_x-500, map_view_center_y-500],
      // [map_view_center_x+500, map_view_center_y+500]
      // ]);
      // var custom_boundary_geometry = new ol.geom.Polygon.fromExtent(custom_boundary_extent1);
      // var custom_boundary = new ol.Feature({
      //   name: "Thing",
      //   geometry: custom_boundary_geometry
      // });
      // customLayer.getSource().addFeature(custom_boundary);
      // map.removeInteraction(draw);
      // map.addInteraction(select);
      // map.addInteraction(modify);
      // map.addOverlay(popover);
      // document.getElementById("popover").innerHTML = "Click on square to modify it!";
    },
  },
};
</script>
<style>
/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>
