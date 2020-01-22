<template>
  <div id="cardDetails">
    <v-card fluid raised>
      <h1>test</h1>
    </v-card>
  </div>
</template>
<script>
export default {
  name: "CardDetails",
  data: () => ({
    photos: [
      {
        src:
          "https://s-media-cache-ak0.pinimg.com/736x/47/b9/7e/47b97e62ef6f28ea4ae2861e01def86c--my-dream-house-dream-big.jpg"
      },
      {
        src: "https://i.ytimg.com/vi/Xx6t0gmQ_Tw/maxresdefault.jpg"
      },
      {
        src: "http://weknowyourdreams.com/images/house/house-08.jpg"
      },
      {
        src:
          "http://www.porterdavis.com.au/~/media/homes/vienna%20h/vienna%20h%2021/facades/vienna_21_albion.jpg?w=582&amp;h=320&amp;crop=1"
      }
    ]
  }),
  computed: {},
  methods: {}
};
</script>
<style></style>
