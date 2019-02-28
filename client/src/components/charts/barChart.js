import { Bar } from 'vue-chartjs';

export default {
  extends: Bar,
  props: {
    type: Bar,
    chartdata: {
      type: Object,
      default: null,
    },
    options: {
      type: Object,
      default: null,
    },
  },
  mounted() {
    // console.log('bar data :: ', this.chartdata, this.options);
    this.renderChart(this.chartdata, this.options);
  },
};
