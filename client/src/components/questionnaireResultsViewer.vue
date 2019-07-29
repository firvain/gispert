<template>
    <v-tabs grow icons centered v-model="activeTab">
      <v-tab ripple>
        <v-icon>list</v-icon>
        <b>{{ $t('message.listOfAnswers')}}</b>
      </v-tab>
      <v-tab ripple>
        <v-icon>bar_chart</v-icon>
        <b>{{ $t('message.aggregates')}}</b>
      </v-tab>
      <v-tab-item>
        <v-container>
          <v-layout row wrap>
            <v-btn block dark outline small color="green"
              @click="changeQuestionnaireMode('normal');"
              v-if="$store.state.questionnaireMode !== 'normal'">
              <v-icon dark>undo</v-icon>
              {{ $t('message.back')}}
            </v-btn>

            <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
            <v-flex xs12 sm12 md12>
              <v-select
                v-bind:items="comboitems"
                item-value="id"
                v-model="activeQuestionnaire"
                :label="$t('message.allAnswers')"
                single-line
                menu-props='bottom'
                v-on:input="loadResultsForQuestionnaire"
              ></v-select>
            </v-flex>

            <v-flex v-if="activeQuestionnaireResults" xs12 sm12 md12>
              <v-container pa-1 ma-0 row v-for="question in activeQuestionnaireResults.results" :key="question.id">
                <v-card>
                  <v-card-title primary-title>
                    <div>
                      <h3 class="headline mb-0">{{ question.title }}</h3>
                    </div>
                  </v-card-title>
                  <v-card-text>

                  <v-flex v-if="question.type === 'textfield' || question.type === 'textfieldvalidation'">
                    {{ question.value }}
                    <span v-if="question.value === null"> {{ $t('message.noValue')}} </span>
                  </v-flex>

                  <v-flex v-if="question.type === 'textarea'">
                    {{ question.value }}
                    <span v-if="question.value === null"> {{ $t('message.noValue')}} </span>
                  </v-flex>

                  <v-flex v-if="question.type === 'combobox'">{{ question.text }}
                    {{ question.value }}
                  </v-flex>

                  <v-flex v-if="question.type === 'radioGroup'">
                    {{ question.value }}
                  </v-flex>

                  <v-flex row wrap v-if="question.type === 'preferenceHierarchy'">
                    <v-list one-line>
                        <template v-for='element in question.value'>
                          <v-list-tile :key="element.id" avatar class='force-hover'>
                            <v-list-tile-content>
                              <v-list-tile-title v-html="element.label"></v-list-tile-title>
                            </v-list-tile-content>
                          </v-list-tile>
                        </template>
                    </v-list>
                  </v-flex>

                  <v-flex v-if="question.type === 'checkboxGroup'">{{ question.text }}
                    <v-flex v-for="checkbox in question.value" :key="checkbox[0]">
                      <v-checkbox
                        :label="checkbox[0]"
                        :value="checkbox[1]"
                        v-model="checkbox[1]"
                        disabled
                        >
                      </v-checkbox>
                    </v-flex>
                  </v-flex>

                  <v-flex v-if="question.type === 'mapPointer'">
                    <v-list two-line>
                      <template v-for="(item, index) in question.value">
                        <v-list-tile :key="index" @click="loadFeature(question.coordinates[index], item)">
                          <v-list-tile-content>
                            <v-list-tile-title v-html="item"></v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </template>
                    </v-list>
                  </v-flex>

                  <v-flex v-if="question.type === 'mapLineString'">
                    <v-list two-line>
                      <template v-for="(item, index) in question.value">
                        <v-list-tile :key="index" @click="loadFeature(question.coordinates[index], item)">
                          <v-list-tile-content>
                            <v-list-tile-title v-html="item"></v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </template>
                    </v-list>
                  </v-flex>

                  <v-flex v-if="question.type === 'mapPointerMultiple'">
                    <v-list one-line>
                      <template v-for="(item, index) in question.value">
                        <v-list-tile :key="index" @click="loadFeature(question.coordinates[index], item)">
                          <v-list-tile-content>
                            <v-list-tile-title v-html="item"></v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </template>
                    </v-list>
                  </v-flex>

                  <v-flex v-if="question.type === 'mapLinesMultiple'">
                    <v-list one-line>
                      <template v-for="(item, index) in question.value">
                        <v-list-tile :key="index" @click="loadFeature(question.coordinates[index], item)">
                          <v-list-tile-content>
                            <v-list-tile-title v-html="item"></v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </template>
                    </v-list>
                  </v-flex>

                  <v-flex v-if="question.type === 'mapPointsLinesMultiple'">
                    <v-list one-line>
                      <template v-for="(item, index) in question.value">
                        <v-list-tile :key="index" @click="loadFeature(question.coordinates[index], item)">
                          <v-list-tile-content>
                            <v-list-tile-title v-html="item"></v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </template>
                    </v-list>
                  </v-flex>

                  <v-flex v-if="question.type === 'tableOfCheckboxes'">
                    <v-layout row wrap>
                      <v-container>
                        <v-flex xs12 md12>
                            <v-layout row wrap>
                                <v-flex xs1> 
                                </v-flex>
                                <v-flex xs1 ma-2 v-for="answer in question.value[0].answers" :key="answer.id">
                                  {{ answer.text }}
                                </v-flex>
                            </v-layout>
                        </v-flex>
                        <v-flex xs12 md12>
                          <v-layout row wrap v-for="item in question.value" :key="item.id">
                            <v-flex xs1 ma-1>{{ item.title }}</v-flex>
                            <v-flex ma-2 v-for="answer in item.answers" :key="answer.id" xs1>
                              <v-checkbox light v-model="answer.selected"></v-checkbox>
                            </v-flex>
                          </v-layout>
                        </v-flex>
                      </v-container>
                    </v-layout>
                  </v-flex>

                  <v-flex ma-0 pa-0 v-if="question.type === 'repeatable'">
                    <v-flex v-for='question in question.questions' :key='question.id'>
                      <questionnaireComponents :question='question'></questionnaireComponents>
                    </v-flex>
                  </v-flex>


                  </v-card-text>
                </v-card>
              </v-container>
            </v-flex>
            <div class="body-1" v-if="activeQuestionnaireResults">
              {{ $t('message.submitted')}}: {{ moment(parseInt(activeQuestionnaireResults.submittedOn)).format('h:mm:ss a, DD-MM-YYYY') }}
            </div>
          </v-layout>
        </v-container>
        </v-tab-item>



        <v-tab-item>
        <v-container>
            <v-btn block dark outline small color="green"
              @click="changeQuestionnaireMode('normal');"
              v-if="$store.state.questionnaireMode !== 'normal'">
              <v-icon dark>undo</v-icon>
              {{ $t('message.back')}}
            </v-btn>
          <v-layout row wrap>

            <v-flex v-if="questionnaireResults">
              <v-flex row pa-1 ma-0 v-for="question in questionnaireAggregates" :key="question.id">
                <v-card>
                  <v-card-title primary-title>
                    <div>
                      <h3 class="headline mb-0">{{ question.title }}</h3>
                    </div>
                  </v-card-title>
                  <v-card-text>
                    <v-layout>
                      <v-flex v-if="question.type === 'textfield'">
                        <v-list one-line>
                          <template v-for="(item, index) in question.values">
                            <v-list-tile :key="index" v-if="item">
                              <v-list-tile-content>
                                <v-list-tile-title v-html="item"></v-list-tile-title>
                              </v-list-tile-content>
                            </v-list-tile>
                          </template>
                        </v-list>
                      </v-flex>

                      <v-flex v-if="question.type === 'textfieldvalidation'">
                        <v-list one-line>
                          <template v-for="(item, index) in question.values">
                            <v-list-tile :key="index" v-if="item">
                              <v-list-tile-content>
                                <v-list-tile-title v-html="item"></v-list-tile-title>
                              </v-list-tile-content>
                            </v-list-tile>
                          </template>
                        </v-list>
                      </v-flex>

                      <v-flex v-if="question.type === 'textarea'">
                        <v-list one-line>
                          <template v-for="(item, index) in question.values">
                            <v-list-tile :key="index" v-if="item">
                              <v-list-tile-content>
                                <v-list-tile-title v-html="item"></v-list-tile-title>
                              </v-list-tile-content>
                            </v-list-tile>
                          </template>
                        </v-list>
                      </v-flex>

                      <v-flex v-if="question.type === 'combobox'">
                        <barChart 
                          v-if="loadedAgreggates"
                          :chartdata="createChartDataForComboboxQuestion(question)"
                          :options="options">
                        </barChart>
                        <table v-if="loadedAgreggates">
                          <tr v-for='(dataset, index) in createChartDataForComboboxQuestion(question).datasets' :key='index'>
                            <td>{{ dataset.label }}</td><td>{{ dataset.data[0] }}</td>
                          </tr>
                        </table>
                      </v-flex>

                      <v-flex v-if="question.type === 'radioGroup'">
                        <barChart 
                          v-if="loadedAgreggates"
                          :chartdata="createChartDataForComboboxQuestion(question)"
                          :options="options">
                        </barChart>
                        <table v-if="loadedAgreggates">
                          <tr v-for='(dataset, index) in createChartDataForComboboxQuestion(question).datasets' :key='index'>
                            <td>{{ dataset.label }}</td><td>{{ dataset.data[0] }}</td>
                          </tr>
                        </table>
                      </v-flex>

                      <v-flex v-if="question.type === 'checkboxGroup'" width='400px'>
                        <barChart
                          v-if="loadedAgreggates"
                          :chartdata="createChartDataForcheckboxGroupQuestion(question)"
                          :options="options">
                        </barChart>
                        <table v-if="loadedAgreggates">
                          <tr v-for='(dataset, index) in createChartDataForcheckboxGroupQuestion(question).datasets' :key='index'>
                            <td>{{ dataset.label[0] }}</td><td>{{ dataset.data[0] }}</td>
                          </tr>
                        </table>
                      </v-flex>

                      <v-flex v-if="question.type === 'tableOfCheckboxes'" width='400px'>
                        <template v-for="item in createChartDataForTableOfCheckboxes(question)">
                          {{ item.labels[0] }}
                          <barChart
                            :key="item.id"
                            v-if="loadedAgreggates"
                            :chartdata="item"
                            :options="options">
                          </barChart>
                          <table v-if="loadedAgreggates" :key="item.id">
                            <tr v-for='(dataset, index) in item.datasets' :key='index'>
                              <td>{{ dataset.label[0] }}</td><td>{{ dataset.data[0] }}</td>
                            </tr>
                          </table>
                        </template>
                      </v-flex>

                      <v-flex v-if="question.type === 'preferenceHierarchy'" width='400px'>
                        <barChart
                          v-if="loadedAgreggates"
                          :chartdata="createChartDataForPreferenceHierarchy(question)"
                          :options="options">
                        </barChart>
                      </v-flex>

                      <v-flex v-if="question.type === 'mapPointer'">
                        <v-btn small dark class="indigo" @click='makeMapFormapPointer(question.id)'>
                          <v-icon dark>location_on</v-icon>{{ $t('message.createMap')}}
                        </v-btn>
                      </v-flex>

                      <v-flex v-if="question.type === 'mapLineString'">
                        <v-btn small dark class="indigo" @click='makeMapFormapPointer(question.id)'>
                          <v-icon dark>location_on</v-icon>{{ $t('message.createMap')}}
                        </v-btn>
                      </v-flex>

                      <v-flex v-if="question.type === 'mapPointerMultiple'">
                        <v-btn small dark class="indigo" @click='makeMapFormapPointer(question.id)'>
                          <v-icon dark>location_on</v-icon>{{ $t('message.createMap')}}
                        </v-btn>
                      </v-flex>

                      <v-flex v-if="question.type === 'mapLinesMultiple'">
                        <v-btn small dark class="indigo" @click='makeMapFormapPointer(question.id)'>
                          <v-icon dark>location_on</v-icon>{{ $t('message.createMap')}}
                        </v-btn>
                      </v-flex>

                      <v-flex v-if="question.type === 'mapPointsLinesMultiple'">
                        <v-btn small dark class="indigo" @click='makeMapFormapPointer(question.id)'>
                          <v-icon dark>location_on</v-icon>{{ $t('message.createMap')}}
                        </v-btn>
                      </v-flex>
                    </v-layout>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-flex>
          </v-layout>

          <v-dialog v-model="exportDataDialog" persistent max-width="800px">
            <v-card>
              <v-card-title>
                {{ $t('message.exportToTable')}}
                <v-spacer></v-spacer>
                <v-text-field
                  append-icon="search"
                  :label="$t('message.search')"
                  single-line
                  hide-details
                  v-model="search"
                ></v-text-field>
              </v-card-title>

              <v-data-table
                  v-bind:headers="dataTable.headers"
                  v-bind:items="dataTable.items"
                  v-bind:search="search"
                >
                <template slot="items" slot-scope="props">
                  <td v-for="header in dataTable.headers" :key="header.value" class="text-xs-right">{{ props.item[header.value] }}</td>
                </template>
                <template slot="pageText" slot-scope="{ pageStart, pageStop }">
                  {{ $t('message.from')}} {{ pageStart }} {{ $t('message.to')}} {{ pageStop }}
                </template>
              </v-data-table>
              <v-btn color="blue darken-1" flat @click.native="exportDataDialog = false">{{ $t("message.close") }}</v-btn>
            </v-card>
          </v-dialog>

          <v-dialog v-model="exportGeoDataDialog" persistent max-width="800px">
            <v-card>
              <v-card-title>
                {{ $t('message.exportMapData')}}
              </v-card-title>
              <table>
                <td>id</td>
                <td>user</td>
                <td>question</td>
                <td>option</td>
                <td>wkt</td>
                <tr v-for="row in geodataTable" :key="row.id">
                  <td>{{ row.id }}</td>
                  <td>{{ row.user }}</td>
                  <td>{{ row.title }}</td>
                  <td>{{ row.question }}</td>
                  <td>{{ row.option }}</td>
                  <td>{{ row.wkt }}</td>
                </tr>
              </table>
              <v-btn color="blue darken-1" flat @click.native="exportGeoDataDialog = false">{{ $t("message.close") }}</v-btn>
            </v-card>
          </v-dialog>
          <v-btn block dark class="indigo" @click.native="makeResultsTable(); exportDataDialog = true;">
            <v-icon dark>archive</v-icon>{{ $t('message.exportToTable')}}
          </v-btn>
          <v-btn block dark class="indigo" @click='exportToWKT(); exportGeoDataDialog = true;'>
            <v-icon dark>location_on</v-icon>{{ $t('message.exportMapData')}}
          </v-btn>
        </v-container>
      </v-tab-item>
    </v-tabs>
</template>

<script>
import axios from 'axios';
import ol from 'openlayers';
import barChart from '@/components/charts/barChart';
import questionnaireComponents from '@/components/questionnaireComponents/questionnaireComponents';
import olMap from '../js/map';
import config from '../config';

export default {
  name: 'questionnaireResultsViewer',
  props: ['id'],
  components: {
    barChart, questionnaireComponents,
  },
  data() {
    return {
      search: '',
      exportDataDialog: false,
      exportGeoDataDialog: false,
      options: {
        responsive: false,
        maintainAspectRatio: false,
        title: { display: false },
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            fontColor: 'black',
          },
        },
        scales: {
          yAxes: [{
            ticks: {
              min: 0,
              stepSize: 1,
            },
          }],
          xAxes: [{
            display: false,
          }],
        },
        animation: {
          animateScale: true,
        },
      },
      loadedAgreggates: false,
      questionnaireResults: null,
      activeTab: null,
      loading: false,
      activeQuestionnaire: {},
      comboitems: [],
      activeQuestionnaireResults: null,
      questionnaireAggregates: [],
      dataTable: {
        headers: [],
        items: [],
      },
      geodataTable: [],
    };
  },
  methods: {
    changeQuestionnaireMode(mode) {
      this.$store.commit('setQuestionnaireMode', mode);
    },
    loadQuestionnaireResults() {
      const serverUrl = `${config.url}/questionnaires/questionnaireResults`;
      axios.get(serverUrl, {
        params: {
          questionnaireId: this.id,
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        this.questionnaireResults = response.data;
        this.getcomboitems();
        this.createAggregates();
      }).then(() => {
        this.loading = false;
      });
    },
    getcomboitems() {
      this.questionnaireResults.forEach((r) => {
        if (r.results && r.results[0]) {
          this.comboitems.push(
            { id: r._id, text: r.results[0].value }); // eslint-disable-line no-underscore-dangle
        } else {
          this.comboitems.push(
            { id: r._id, text: '-' }); // eslint-disable-line no-underscore-dangle
        }
      });
      // console.log('combo items :: ', this.comboitems);
    },
    loadResultsForQuestionnaire() {
      console.log('loading::', this.activeQuestionnaire);
      console.log('questionnaire results:: ', this.questionnaireResults);
      this.activeQuestionnaireResults = this.questionnaireResults.filter(r =>
        r._id.indexOf( // eslint-disable-line no-underscore-dangle
          this.activeQuestionnaire) > -1, // eslint-disable-line no-underscore-dangle
      )[0];
      console.log('active questionnaire results:: ', this.activeQuestionnaireResults);
    },
    loadFeature(featureToLoad, text) {
      console.log('load feature::', featureToLoad);
      const geojsonFormat = new ol.format.GeoJSON();
      console.log('adding a post feature data:: ', text);
      const featuresToLoad = geojsonFormat.readFeatures(featureToLoad);
      if (featuresToLoad.length > 0) {
        let allLayers = [];
        allLayers = olMap.getLayers().getArray();
        allLayers.forEach((layer) => {
          if (layer.getProperties().name === 'customLayer') {
            featuresToLoad.forEach((f) => {
              let alreadyExists = false;
              layer.getSource().forEachFeature((feature) => {
                if (feature.get('buttonId') === f.getProperties().buttonId) {
                  alreadyExists = true;
                }
              });
              if (!alreadyExists) {
                let message = '';
                if (text.length > 20) {
                  message = `${text.substr(0, 20)}...`;
                } else {
                  message = text;
                }
                f.setProperties({
                  messages: message,
                });
                console.log(featuresToLoad);
                layer.getSource().addFeature(featuresToLoad[0]);
              }
            });
          }
          const g = featuresToLoad[0].getGeometry().getExtent();
          if (g[0] - g[2] < 500) {
            g[0] -= 100;
            g[2] += 100;
          }
          if (g[1] - g[3] < 500) {
            g[1] -= 100;
            g[3] += 100;
          }
          olMap.getView().fit(g, olMap.getSize());
        });
      }
    },
    createAggregates() {
      // TODO if question has parent id group results by parent id
      const getQuestions = new Promise((resolve) => {
        const questions = [];
        this.questionnaireResults[0].results.forEach((r) => {
          questions.push({ id: r.id, title: r.title, type: r.type });
        });
        resolve(questions);
      });

      getQuestions.then((questions) => {
        questions.forEach((question) => {
          const questionnaireAggregate = {
            id: question.id,
            title: question.title,
            type: question.type,
            values: [],
            coordinates: [],
          };
          this.questionnaireResults.forEach((q) => {
            q.results.forEach((r) => {
              if (r.id === question.id) {
                questionnaireAggregate.values.push(r.value);
                if (r.coordinates && r.coordinates.length > 0) {
                  questionnaireAggregate.coordinates.push(r.coordinates);
                }
              }
            });
          });
          this.questionnaireAggregates.push(questionnaireAggregate);
        });
        console.log('aggregation :: ', this.questionnaireAggregates);
      });
      this.loadedAgreggates = true;
    },
    createChartDataForPreferenceHierarchy(question) {
      // console.log('question values', question.values);
      const data = {};
      let optionsLength = 0;
      question.values[0].forEach((o, index) => {
        optionsLength += index + 1;
      });
      question.values.forEach((val) => {
        val.forEach((v, index) => {
          console.log('label:: ', v.label, Math.abs(index - val.length), optionsLength);
          data[v.label] = (Math.abs(index - val.length) /
            (question.values.length * optionsLength)) + (data[v.label] || 0);
        });
      });
      // console.log('data :: ', data);
      const chartdata = {
        labels: [],
        datasets: [],
      };
      chartdata.labels.push(question.title);
      Object.keys(data).forEach((key, index) => {
        const dataset = {
          label: this.shortenText(key),
          // eslint-disable-next-line
          backgroundColor: this.pickRandomColor(index),
          data: [data[key]],
        };
        chartdata.datasets.push(dataset);
      });
      return chartdata;
    },
    createChartDataForComboboxQuestion(question) {
      const chartdata = {
        labels: [],
        datasets: [],
      };
      chartdata.labels.push(question.title);
      Object.keys(this.countUniqueValues(question.values)).forEach((key, index) => {
        // console.log(key);
        if (key !== 'null') {
          const dataset = {
            label: this.shortenText(key),
            // eslint-disable-next-line
            backgroundColor: this.pickRandomColor(index),
            data: [this.countUniqueValues(question.values)[key]],
          };
          chartdata.datasets.push(dataset);
        }
      });
      // console.log('combobox chartdata to see result :: ', JSON.stringify(chartdata));
      return chartdata;
    },
    createChartDataForTableOfCheckboxes(question) {
      // console.log('creating data for table of checkboxes:: ', question);
      const titles = [];
      question.values[0].forEach((v) => {
        v.answers.forEach((t) => {
          titles.push({ id: t.id, qid: v.id, title: v.title, option: t.text, count: 0 });
        });
      });
      // console.log('titles:: ', titles);
      const lines = [];
      question.values.forEach((r) => {
        // console.log('r: ', r);
        r.forEach((l) => {
          lines.push(l);
        });
      });
      // console.log(lines);
      const groupBy = key => array =>
        array.reduce((objectsByKeyValue, obj) => {
          const value = obj[key];
          // eslint-disable-next-line
          objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
          return objectsByKeyValue;
        }, {});

      const groupById = groupBy('id');
      // console.log('group by id:: ', groupById(lines));
      const groups = groupById(lines);
      Object.entries(groups).forEach((g) => {
        Object.keys(g).forEach((key) => {
          const value = g[key];
          if (Array.isArray(value)) {
            value.forEach((v) => {
              v.answers.forEach((an) => {
                if (an.selected) {
                  const objIndex = titles.findIndex((obj => obj.id === an.id));
                  titles[objIndex].count += 1;
                }
              });
            });
          }
        });
      });
      // console.log('final titles::::: ', titles);
      const groupByQuestion = groupBy('title');
      const finalgroups = groupByQuestion(titles);
      // console.log('titles groups :: ', groupByQuestion(titles));
      // console.log('-------------------------------------------------------');
      const chartDataArray = [];
      Object.keys(finalgroups).forEach((key) => {
        // console.log(key);
        const chartdata = {
          labels: [key],
          datasets: [],
        };
        finalgroups[key].forEach((k, i) => {
          const dataset = {
            label: [this.shortenText(k.option)],
            // eslint-disable-next-line
            backgroundColor: this.pickRandomColor(i),
            data: [k.count],
          };
          chartdata.datasets.push(dataset);
        });
        chartDataArray.push(chartdata);
      });
      // console.log('chartdata for table :: ', JSON.stringify(chartDataArray));
      return chartDataArray;
    },
    createChartDataForcheckboxGroupQuestion(question) {
      const chartdata = {
        labels: [question.title],
        // labels: [],
        datasets: [],
      };
      const uniqueValues = {};
      question.values[0].forEach((v) => {
        uniqueValues[`${v[0]}`] = 0;
      });
      question.values.forEach((v) => {
        v.forEach((bool) => {
          if (bool[1] === true) {
            uniqueValues[`${bool[0]}`] += 1;
          }
        });
      });
      Object.keys(uniqueValues).forEach((key, index) => {
        const dataset = {
          label: [this.shortenText(key)],
          // eslint-disable-next-line
          backgroundColor: this.pickRandomColor(index),
          data: [uniqueValues[key]],
        };
        chartdata.datasets.push(dataset);
      });
      return chartdata;
    },
    pickRandomColor(index) {
      // TODO find a proper palette
      const colors = ['#ee4035',
        '#f37736',
        '#fdf498',
        '#7bc043',
        '#0392cf',
        '#ffff66',
        '#04284a',
        '#ff6b68',
        '#c1a180',
        '#ee8166',
        '#8ff2af'];
      const result = colors[index];
      // console.log('result:: ', result);
      return result;
    },
    shortenText(text) {
      let message = '';
      if (text.length > 32) {
        message = `${text.substr(0, 32)}...`;
      } else {
        message = text;
      }
      return message;
    },
    formatLabel(str, maxwidth) {
      const sections = [];
      const words = str.split(' ');
      let temp = '';

      words.forEach((item, index) => {
        if (temp.length > 0) {
          const concat = `${temp} ${item}`;
          if (concat.length > maxwidth) {
            sections.push(temp);
            temp = '';
          } else {
            // eslint-disable-next-line
            if (index === (words.length - 1)) {
              sections.push(concat);
              return;
            // eslint-disable-next-line
            } else {
              temp = concat;
              return;
            }
          }
        }
        if (index === (words.length - 1)) {
          sections.push(item);
          return;
        }
        if (item.length < maxwidth) {
          temp = item;
        } else {
          sections.push(item);
        }
      });
      return sections;
    },
    countUniqueValues(arr) {
      const counts = {};
      for (let i = 0; i < arr.length; i += 1) {
        counts[arr[i]] = 1 + (counts[arr[i]] || 0);
      }
      // console.log('counts is :: ', counts);
      return counts;
    },
    makeMapFormapPointer(questionId) {
      let allLayers = [];
      let customLayerObj;
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach((layer) => {
        if (layer.getProperties().name === 'customLayer') {
          layer.getSource().clear();
          customLayerObj = layer;
        }
      });

      const geojsonFormat = new ol.format.GeoJSON();
      // console.log('making map for this id :: ', questionId);
      const mapPointerQuestion = this.questionnaireAggregates.filter(obj => obj.id === questionId);
      // console.log('question 8 coordinates :: ', mapPointerQuestion[0].coordinates);
      mapPointerQuestion[0].coordinates.forEach((pair) => {
        pair.forEach((coord) => {
          const featureToLoad = geojsonFormat.readFeatures(coord);
          // console.log(featureToLoad[0]);
          allLayers.forEach((layer) => {
            if (layer.getProperties().name === 'customLayer') {
              let message = '';
              if (featureToLoad[0].getProperties().label.length > 20) {
                message = `${featureToLoad[0].getProperties().label.substr(0, 20)}...`;
              } else {
                message = featureToLoad[0].getProperties().label;
              }
              featureToLoad[0].setProperties({
                messages: message,
              });
              // console.log(featureToLoad);
              layer.getSource().addFeature(featureToLoad[0]);
            }
          });
          olMap.getView().fit(customLayerObj.getSource().getExtent(), olMap.getSize());
          // console.log(featureToLoad[0].getProperties().buttonId);
          // this.loadFeature(coord, featureToLoad[0].getProperties().label);
        });
      });
    },
    exportToWKT() {
      const wktFormat = new ol.format.WKT();
      const geojsonFormat = new ol.format.GeoJSON();
      const table = [];
      this.questionnaireResults.forEach((r) => {
        let j = 0;
        r.results.forEach((row) => {
          if (row.type === 'mapPointer'
            || row.type === 'mapLineString'
            || row.type === 'mapPointerMultiple'
            || row.type === 'mapLinesMultiple'
            || row.type === 'mapPointsLinesMultiple') {
            console.log('row simple :: ', row);
            for (let i = 0; i < row.value.length; i += 1) {
              j += 1;
              if (row.coordinates.length > 0 && row.coordinates[i]) {
                console.log('coords:: ', j, wktFormat.writeFeature(geojsonFormat.readFeatures(row.coordinates[i])[0]));
                table.push({ id: j,
                  user: r.results[0].value,
                  title: row.title,
                  question: row.id,
                  option: row.value[i],
                  wkt: wktFormat.writeFeature(geojsonFormat.readFeatures(row.coordinates[i])[0]),
                });
              } else {
                table.push({ id: j,
                  user: r.results[0].value,
                  title: row.title,
                  question: row.id,
                  option: row.value[i],
                  wkt: '',
                });
              }
            }
          }
        });
        console.log('new row:: ', table);
      });
      this.geodataTable = table;
    },
    makeResultsTable() {
      this.dataTable = {
        headers: [],
        items: [],
      };
      // const tableRow = [];
      console.log('q results :: ', this.questionnaireResults);
      // this.questionnaireResults.forEach((r) => {
        // tableRow.push({ submittedOn: r.submittedOn });
      this.questionnaireResults[0].results.forEach((row) => {
        if (row.type !== 'mapPointerMultiple') {
          if (row.type === 'checkboxGroup') {
            row.value.forEach((v, index) => {
              this.dataTable.headers.push({ text: v[0], value: `${row.id}_${index}` });
              // tableRow.push(v[0]);
            });
          } else if (row.type === 'mapPointer') {
            row.value.forEach((v, index) => {
              this.dataTable.headers.push({ text: v, value: `${row.id}_${index}` });
              // tableRow.push(v);
            });
          } else if (row.type === 'tableOfCheckboxes') {
            console.log('this is a toc row :: ', row);
            row.value.forEach((v, vindex) => {
              v.answers.forEach((a, index) => {
                this.dataTable.headers.push({ text: `${v.title}:${a.text}`, value: `${row.id}_${vindex}_${index}` });
                console.log(`${row.id}_${vindex}_${index}`);
              });
              // tableRow.push(v);
              // this.dataTable.headers.push({ text: v[0].title, value: `${row.id}` });
            });
          } else {
            // tableRow.push(row.title);
            this.dataTable.headers.push({ text: row.title, value: row.id });
          }
        }
      });
      // });
      // console.log('headers :: ', this.dataTable.headers.length,
      console.log(JSON.stringify(this.dataTable.headers));

      this.questionnaireResults.forEach((r) => {
        const newRow = {};
        r.results.forEach((row) => {
          if (row.type !== 'mapPointerMultiple' && row.type !== 'mapLinesMultiple') {
            if (row.type === 'checkboxGroup') {
              row.value.forEach((v, index) => {
                if (v[1]) { newRow[`${row.id}_${index}`] = this.$t('message.yes'); } else { newRow[`${row.id}_${index}`] = this.$t('message.no'); }
                // newRow[`${row.id}_${index}`] = v[1].toString();
              });
            } else if (row.type === 'mapPointer' || row.type === 'mapLineString') {
              row.value.forEach((v, index) => {
                newRow[`${row.id}_${index}`] = v;
              });
            } else if (row.type === 'tableOfCheckboxes') {
              const columns = {};
              console.log(row, row.length);
              row.value.forEach((v, vindex) => {
              //   console.log('v in row value of toc :: ', v);
                v.answers.forEach((a, index) => {
                  if (a.selected === true) {
                    columns[`${row.id}_${vindex}_${index}`] = this.$t('message.yes');
                  } else {
                    columns[`${row.id}_${vindex}_${index}`] = this.$t('message.no');
                  }
                  // console.log(`${row.id}_${vindex}_${index}`, a.selected);
              //     this.dataTable.items.push(newRow);
                });
                console.log('new column');
              });
              console.log('columns :: ', columns);
              Object.assign(newRow, columns);
              // newRow = { ...newRow, columns };
            } else {
              newRow[`${row.id}`] = row.value;
              console.log('normal table row :: ', newRow[`${row.id}`]);
            }
          }
        });
        // console.log('newrow :: ', newRow);
        this.dataTable.items.push(newRow);
      });
      // console.log('items :: ', this.dataTable
      // .items.length, JSON.stringify(this.dataTable.items));
    },
  },
  mounted() {
    this.loadQuestionnaireResults();
  },
};
</script>
