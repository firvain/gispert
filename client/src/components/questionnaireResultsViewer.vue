<template>
  <v-container>
    <v-tabs dark grow icons centered v-model="activeTab">
      <v-tabs-bar class="blue-grey">
        <v-tabs-slider color="red"></v-tabs-slider>
        <v-tabs-item href="#list" active-class="blue-grey lighten" class="blue-grey lighten-3" ripple>
          <v-icon>list</v-icon>
          <b>Λίστα απαντήσεων</b>
        </v-tabs-item>
        <v-tabs-item href="#aggregates" active-class="blue-grey lighten" class="blue-grey lighten-3" ripple>
          <v-icon>bar_chart</v-icon>
          <b>Συγκεντρωτικά</b>
        </v-tabs-item>
      </v-tabs-bar>
      <v-tabs-items>
        <v-tabs-content
          id="list"
        >
          <v-data-table
            v-bind:headers="headers"
            :items="items"
            hide-actions
            class="elevation-1"
          >
            <template slot="items" slot-scope="props">
              <td>{{ props.item.name }}</td>
              <td class="text-xs-right">{{ props.item.calories }}</td>
              <td class="text-xs-right">{{ props.item.fat }}</td>
              <td class="text-xs-right">{{ props.item.carbs }}</td>
            </template>
          </v-data-table>
        </v-tabs-content>
        <v-tabs-content
          id="aggregates"
        >
          
        </v-tabs-content>
      </v-tabs-items>
    </v-tabs>
    <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
    <!-- <line-chart
      v-if="loaded"
      :chartdata="chartdata"
      :options="options"/> -->
  </v-container>
</template>

<script>
import axios from 'axios';
// import olMap from '../js/map';
import config from '../config';

export default {
  name: 'questionnaireResultsViewer',
  props: ['id'],
  data() {
    return {
      results: null,
      activeTab: null,
      loading: false,
      headers: [
        {
          text: 'Dessert (100g serving)',
          align: 'left',
          sortable: false,
          value: 'name',
        },
        { text: 'Calories', value: 'calories' },
        { text: 'Fat (g)', value: 'fat' },
        { text: 'Carbs (g)', value: 'carbs' },
      ],
      items: [
        {
          value: false,
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0,
          carbs: 24,
        },
        {
          value: false,
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9.0,
          carbs: 37,
        },
      ],
    };
  },
  methods: {
    loadQuestionnaireResults() {
      const serverUrl = `${config.url}/public/questionnaireResults`;
      axios.get(serverUrl, { params: {
        questionnaireId: this.id,
      },
      }).then((response) => {
        this.results = response.data;
      }).then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loadQuestionnaireResults();
  },
};
</script>
