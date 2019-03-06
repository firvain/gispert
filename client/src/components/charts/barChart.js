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
    plugins: [{
      beforeInit: () => {
        console.log(this.chartdata);
        this.chartdata.datasets[0].labels.forEach((e, i, a) => {
          console.log(e, i, a);
          if (/\n/.test(e)) {
            // eslint-disable-next-line
            a[i] = e.split(/\n/);
          }
        });
      },
    }],
  },
  mounted() {
    // console.log('bar data :: ', this.chartdata, this.options);
    this.renderChart(this.chartdata, this.options);
  },
};
