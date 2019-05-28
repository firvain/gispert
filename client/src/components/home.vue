<template>
<div id="app">
  <v-app>
    <v-content>
      <v-container fill-height fluid pa-0 ma-0>
          <v-layout justify-center align-center>
            <v-flex xs6 text-xs-center>
              <v-card height='100vh'>
                <v-img
                  height='100%'
                  class="white--text"
                  :src="currentTab.menuImage"
                >
                  <v-container pa-1 grid-list-md text-xs-center fill-height>
                    <v-layout  row wrap align-content-space-between fill-height>
                      <v-flex xs12>
                        <v-flex xs12>
                          <h1 class="display-1 font-weight-thin mb-0 inImage" style= "background-color: rgba(100, 100, 100, 0.3);">Geobabel</h1>
                          <h4 class="headline inImage font-weight-thin" style= "background-color: rgba(100, 100, 100, 0.3);">Innovation in citizen engagement!</h4>
                        </v-flex>
                        <v-flex xs12 style= "background-color: rgba(100, 100, 100, 0.6);" pa-2 mt-2>
                          <v-btn outline dark @click="changeTab(1)">
                            What is Geobabel?
                          </v-btn>
                          <v-btn outline dark @click="changeTab(2)">
                            Features
                          </v-btn>
                          <v-btn outline dark @click="changeTab(3)">
                            Use cases
                          </v-btn>
                          <v-btn outline dark @click="changeTab(6)">
                            Case studies
                          </v-btn>
                          <v-btn outline dark @click="changeTab(4)">
                            Pricing
                          </v-btn>
                          <v-btn outline dark @click="changeTab(5)">
                            Contact us
                          </v-btn>
                        </v-flex>
                      </v-flex>
                      <v-flex xs12 style= "background-color: rgba(100, 100, 100, 0.6);">
                        <h1 class="display-2">{{ currentTab.title }}</h1>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-img>
              </v-card>
            </v-flex>
            <v-flex xs6 v-if='currentTab.id === 1'>
              <v-flex pl-4 pt-4 pr-4 style='overflow-y: auto; max-height: 100%; height: 100vh'>
                <v-flex xs12 class="text-align-center">
                  <span class="display-2 font-weight-thin">Welcome to the Geobabel platform!</span>
                </v-flex>

                <v-layout pa-4 ma-4 row wrap>
                  <v-flex xs6 class="subheading">
                    <h2 class="font-weight-thin">
                    <span class="font-weight-black">Geobabel</span> is a complete toolbox for <span class="font-weight-black">citizen engagement</span> in decision making.
                    </h2>
                    <span class="font-weight-thin">
                    Brings together local authorities, citizens, planners or researchers on the same table to
                    discuss and give feedback to each other, resulting in more participatory decision making and <span class="font-weight-black">substantive public participation</span>.
                    </span>
                  </v-flex>
                  <v-flex xs6>
                    <p><meetingTable color="green--outline" :width="250" :strokeWidth="10" /></p>
                  </v-flex>
                </v-layout>

                <v-layout pa-4 ma-4 row wrap>
                  <v-flex xs6>
                  <v-flex>
                    <questionnaireVector :width="100"></questionnaireVector>
                    <ratings :width="200"></ratings>
                    <mapComments :width="350"></mapComments>
                  </v-flex>
                  </v-flex>
                  <v-flex xs6 class="subheading">
                    <h2 class="font-weight-thin">
                     How?
                    </h2>
                    <span class="font-weight-thin">
                      Geobabel <span class="font-weight-black">combines</span> simply and effective the <span class="font-weight-black">crowdsourcing methods with the map</span> using questionnaires, opinion sharing, rating ideas and brainstorming. 
                    </span>
                  </v-flex>
                </v-layout>

              </v-flex>
            </v-flex>

            <v-flex xs6 pl-2 text-xs-center v-if='currentTab.id === 2'>
              <p>Conduct questionnaire research - use the questionnaire creator and results viewer (Publish questionnaire)</p>
              <p>Data collection - collect data about places (Draw on the map places)</p>
              <p>Opinion Seeking - people can comment on places seeking ideas and solutions, brainstorming about places (Comment on this place)</p>
              <p>Crowdvoting - rating ideas about places or rating places (rate this place, order places by preference)</p>
              <v-layout pa-4 ma-4 row wrap>
                <v-flex xs6 class="subheading">
                  <h2 class="font-weight-thin">
                    PC, tablet, mobile friendly
                  </h2>
                  <span class="font-weight-thin">
                  Brings together local authorities, citizens, planners or researchers on the same table to
                  discuss and give feedback to each other, resulting in more participatory decision making and <u>substantive public participation</u>.
                  </span>
                </v-flex>
                <v-flex xs6>
                  <p><meetingTable color="green--outline" :width="250" :strokeWidth="10" /></p>
                </v-flex>
              </v-layout>
            </v-flex>

            <v-flex xs6 pl-2 text-xs-center v-if='currentTab.id === 3'>
              <v-flex pl-4 pt-4 pr-4 style='overflow-y: auto; max-height: 100%; height: 100vh'>
                <v-flex xs12 class="text-align-center">
                  <span class="display-2 font-weight-thin">{{ currentTab.title }}</span>
                  <h2 class="font-weight-thin">When to use Geobabel? Typically when you have to involve citizens in the planning process. We are listing below some of the cases where the platform can be very helpful.</h2>
                </v-flex>
                <br><useCases width='70%'></useCases>

              </v-flex>
            </v-flex>

            <v-flex xs6 pl-2 text-xs-center v-if='currentTab.id === 4'>
              <v-flex pl-4 pt-4 pr-4 style='overflow-y: auto; max-height: 100%; height: 100vh'>
                <v-flex xs12 class="text-align-center">
                  <span class="display-2 font-weight-thin">{{ currentTab.title }}</span>
                </v-flex>
                <pricing width="70%"></pricing>
              </v-flex>
            </v-flex>

            <v-flex xs6 pl-2 text-xs-center v-if='currentTab.id === 5'>
              <v-flex pl-4 pt-4 pr-4 style='overflow-y: auto; max-height: 100%; height: 100vh'>
                <v-flex xs12 class="text-align-center">
                  <span class="display-2 font-weight-thin">{{ currentTab.title }}</span>
                </v-flex>
                <v-flex>
                  <h1>Terra Cognita</h1>
                  <h2>www.terracognita.eu</h2>
                  <h2>info@terracognita.eu</h2>
                  <h3>Lechovou 3</h3>
                  <h3>GR-501 31 Kozani</h3>
                  <h3>Greece</h3>
                </v-flex>
              </v-flex>
            </v-flex>

            <v-flex xs6 pl-2 text-xs-center v-if='currentTab.id === 6'>
              <v-flex pl-4 pt-4 pr-4 style='overflow-y: auto; max-height: 100%; height: 100vh'>
                <v-flex xs12 class="text-align-center">
                  <span class="display-2 font-weight-thin">{{ currentTab.title }}</span>
                </v-flex>
                <v-layout row wrap>
                  <v-flex xs6 pa-2>
                    <v-card>
                      <v-img
                        src="https://cdn.vuetifyjs.com/images/cards/desert.jpg"
                        aspect-ratio="2.75"
                      ></v-img>
                      <v-card-title primary-title>
                        <div>
                          <h3 class="headline mb-0">SUMP in the city of Kozani</h3>
                        </div>
                      </v-card-title>
                      <v-card-text>
                        The Sustainable Urban Mobility Planning
                      </v-card-text>
                    </v-card>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-flex>

          </v-layout>
        </v-container>
    </v-content>
  </v-app>
</div>
</template>
<script>
import meetingTable from '@/components/svg/meeting_table';
import platformfeatures from '@/components/svg/features';
import questionnaireVector from '@/components/svg/questionnaire';
import ratings from '@/components/svg/ratings';
import mapComments from '@/components/svg/map_with_comments';
import useCases from '@/components/svg/use_cases';
import pricing from '@/components/svg/pricing';

export default {
  data() {
    return {
      currentTab: { id: 1, title: 'What is Geobabel?!', menuImage: '../static/images/abstract-adult-background-1079033.jpg' },
      tabs: [
        { id: 1, title: 'What is Geobabel?', menuImage: '../static/images/abstract-adult-background-1079033.jpg' },
        { id: 2, title: 'Features', menuImage: '../static/images/adult-book-business-297755s.jpg' },
        { id: 3, title: 'Use cases', menuImage: '../static/images/bird-s-eye-view-buildings-cars-373974.jpg' },
        { id: 4, title: 'Pricing', menuImage: '../static/images/pricing.jpg' },
        { id: 5, title: 'Contact us', menuImage: '../static/images/contactus1.jpg' },
        { id: 6, title: 'Case studies', menuImage: '../static/images/blank-charts-computer-669619.jpg' },
      ],
    };
  },
  components: {
    meetingTable, platformfeatures, questionnaireVector, ratings, mapComments, useCases, pricing,
  },
  methods: {
    changeTab(id) {
      this.currentTab = this.tabs.find(obj => obj.id === id);
    },
  },
};
</script>
<style scoped>

</style>
