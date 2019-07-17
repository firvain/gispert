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
                      <v-flex xs12 style= "background-color: rgba(100, 100, 100, 0.6);" pa-2 mt-2>
                        <v-btn outline dark @click="changeTab(1)">
                          User login
                        </v-btn>
                        <v-btn outline dark @click="changeTab(2)">
                          Administrator login
                        </v-btn>
                        <v-btn outline dark @click="changeTab(2)">
                          Try demo
                        </v-btn>
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
                    <peopleHoldingMap width='100%'></peopleHoldingMap>
                  </v-flex>
                  <v-flex xs6 class="subheading">
                    <h2 class="font-weight-thin">
                     How?
                    </h2>
                    <span class="font-weight-thin">
                      Geobabel <span class="font-weight-black">combines</span> simply and effective the
                      <span class="font-weight-black">crowdsourcing methods with the map</span>.
                      Implements questionnaire research, opinion sharing and brainstorming on geographical data.
                    </span>
                  </v-flex>
                </v-layout>
                <v-divider></v-divider>
                <v-flex class = "text-xs-center subheading">
                <h2 class="font-weight-thin">Using the Geobabel toolbox you can conduct</h2>
                </v-flex>
                <v-layout row wrap pa-4 ma-4 class="font-weight-thin">
                  <v-flex xs6>
                    <questionnaireVector :width="100"></questionnaireVector>
                    <ratings :width="200"></ratings>
                  </v-flex>
                  <v-flex xs6 class="subheading">
                    <span class="font-weight-thin">
                      <span class="font-weight-black">Questionnaire research.</span> Conducting questionnaire research can take into account the spatial aspect of questions. The questioner can use the questionnaire creator and the results viewer to publish and analyse the results.
                      The questionnaires may include spatial questions that require the user to draw or point on the map eg where is the origin and destination to work (urban mobility analysis) or which is a nice walking/cultural route or where the new school should be built.
                      <br><span class="font-weight-black">Crowdvoting</span> is feasible as ideas about places can be rated through questionnaire. Users can rate places or order them by preference. Can be used to quickly assess places for allocation problems.</p>
                    </span>
                  </v-flex>
                  <v-flex xs6 class="subheading font-weight-thin">
                    <p><span class="font-weight-black">Opinion Seeking</span> is a process where people can comment on places seeking ideas and solutions. They are brainstorming about places and express their point of view.
                    With Geobabel they can decide having in mind data already presented on the map and the discussion going on every place of the map. Can be used to deeply assess places for allocation problems.</p>
                    <p><span class="font-weight-black">Data collection</span> can be achieved as users are summoned to draw on the map places (points, lines or polygons) considering a subject and talk about it. Geobabel can be a great repository for empirical data.</p>
                  </v-flex>
                  <v-flex xs6>
                    <mapComments width="80%"></mapComments>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-flex>

            <v-flex xs6 pl-2 text-xs-start v-if='currentTab.id === 2'>
              <v-flex pl-4 pt-4 pr-4 style='overflow-y: auto; max-height: 100%; height: 100vh'>
                <v-flex xs12 class="text-align-start">
                  <span class="display-2 font-weight-thin">{{ currentTab.title }}</span>
                  <h2 class="font-weight-thin">Geobabel is specially designed for maximizing citizen engagement. Emphasizing on accessibility special care has been taken
                    according to the WCAG standards.
                  </h2>
                </v-flex>
                <v-flex xs12 class="text-align-start">
                  <h2 class="font-weight-thin">Moreover, the platform is accessible through desktops, laptops, tablets and is mobile friendly.</h2>
                </v-flex>
                <v-flex xs12 ma-4 class="text-align-center">
                  <devices width='40%'></devices>
                </v-flex>
              </v-flex>
            </v-flex>

            <v-flex xs6 pl-2 text-xs-start v-if='currentTab.id === 3'>
              <v-flex pl-4 pt-4 pr-4 style='overflow-y: auto; max-height: 100%; height: 100vh'>
                <v-flex xs12 class="text-align-start">
                  <span class="display-2 font-weight-thin">{{ currentTab.title }}</span>
                  <h2 class="font-weight-thin">When to use Geobabel? Typically when you have to involve citizens in the planning process. Just to inform them 
                    or <span class="font-weight-black">actively engage</span> them. We are listing below some of the cases where the platform can be very helpful.</h2>
                </v-flex>
                <v-flex xs12 class="text-align-start">
                <h2 class="font-weight-thin">Using Geobabel you can draw and share places and routes for crowd evaluation and comment or even create a
                  tourist guide, a georeferenced news service, a parking information service, real estate promotion, present public works and traffic events, campaigns
                  to encouge walking or biking (sustainable mobility), show bus routes and stops. It is a generic map publishing service to get feedback or not.</h2>
                </v-flex>
                <br><useCases width='70%'></useCases>

              </v-flex>
            </v-flex>

            <v-flex xs6 pl-2 text-xs-start v-if='currentTab.id === 4'>
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
                <v-flex mt-4 class="title font-weight-thin">
                  <logo></logo><br>
                  <v-divider></v-divider>
                  <span><v-icon>public</v-icon>www.terracognita.eu</span><br>
                  <span><v-icon>email</v-icon>info@terracognita.eu</span><br>
                  <span>Lechovou 3</span><br>
                  <span>GR-501 31 Kozani</span><br>
                  <span>Greece</span><br>
                </v-flex>
              </v-flex>
            </v-flex>

            <v-flex xs6 pl-2 text-xs-start v-if='currentTab.id === 6'>
              <v-flex pl-4 pt-4 pr-4 style='overflow-y: auto; max-height: 100%; height: 100vh'>
                <v-flex xs12 class="text-align-center">
                  <span class="display-2 font-weight-thin">{{ currentTab.title }}</span>
                </v-flex>
                <v-layout row wrap>
                  <v-flex xs4 pa-2>
                    <peopleHoldingMap width='100%'></peopleHoldingMap>
                  </v-flex>
                  <v-flex xs8 pa-2>
                    <h2 class="font-weight-thin">In the Prefecture of Thessaly citizens where summoned to propose places of cultural or environmental value to be part of an Integrated Territorial Investment.
                    </h2>
                    <v-divider></v-divider>
                  </v-flex>
                </v-layout>
                <v-layout row wrap>
                  <v-flex xs4 pa-2>
                    <mobility width='100%'></mobility>
                  </v-flex>
                  <v-flex xs8 pa-2>
                    <h2 class="font-weight-thin">In the city of Lamia (Greece) citizens summoned to locate mobility problems in their city. Citizen generated data where used to improve
                      the Sustainable Mobility Plan.
                    </h2>
                    <v-divider></v-divider>
                  </v-flex>
                </v-layout>
                <v-layout row wrap>
                  <v-flex xs4 pa-2>
                    <mobility width='100%'></mobility>
                  </v-flex>
                  <v-flex xs8 pa-2>
                    <h2 class="font-weight-thin">In the city of Kozani (Greece) citizens summoned to locate mobility problems in their city. Citizen generated data where used to improve
                      the Sustainable Mobility Plan.
                    </h2>
                    <v-divider></v-divider>
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
import logo from '@/components/svg/terracognitalogo';
import peopleHoldingMap from '@/components/svg/people_holding_map';
import devices from '@/components/svg/devices';
import mobility from '@/components/svg/mobility';

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
    meetingTable,
    platformfeatures,
    questionnaireVector,
    ratings,
    mapComments,
    useCases,
    pricing,
    logo,
    peopleHoldingMap,
    devices,
    mobility,
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
