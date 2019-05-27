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
                  src="../static/images/abstract-adult-background-1079033.jpg"
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
                    <u>Geobabel</u> is a complete toolbox for <u>citizen engagement</u> in decision making.
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

                <v-layout pa-4 ma-4 row wrap>
                  <v-flex xs6>
                  <v-flex>
                      <meetingTable color="green--outline" :width="100" :strokeWidth="10" />
                      <meetingTable color="green--outline" :width="100" :strokeWidth="10" />
                      <meetingTable color="green--outline" :width="100" :strokeWidth="10" />
                      <meetingTable color="green--outline" :width="100" :strokeWidth="10" />
                  </v-flex>
                  </v-flex>
                  <v-flex xs6 class="subheading">
                    <h2 class="font-weight-thin">
                     How?
                    </h2>
                    <span class="font-weight-thin">
                      Geobabel <u>combines</u> simply and effective the <u>crowdsourcing methods with the map</u> using questionnaires, commenting, rating ideas and brainstorming. 
                    </span>
                  </v-flex>
                </v-layout>

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
            </v-flex>

            <v-flex xs6 pl-2 text-xs-center v-if='currentTab.id === 2'>
              <p>Conduct questionnaire research - use the questionnaire creator and results viewer (Publish questionnaire)</p>
              <p>Data collection - collect data about places (Draw on the map places)</p>
              <p>Opinion Seeking - people can comment on places seeking ideas and solutions, brainstorming about places (Comment on this place)</p>
              <p>Crowdvoting - rating ideas about places or rating places (rate this place, order places by preference)</p>
            </v-flex>

            <v-flex xs6 pl-2 text-xs-center v-if='currentTab.id === 3'>
              <v-flex pl-4 pt-4 pr-4 style='overflow-y: auto; max-height: 100%; height: 100vh'>
                <v-flex xs12 class="text-align-center">
                  <span class="display-2 font-weight-thin">{{ currentTab.title }}</span>
                </v-flex>
                When to use Geobabel? Typically when you have to involve citizens in the planning process. We are listing below some of the cases where the platform can be very helpful.
                <v-layout row wrap>
                  <v-flex xs6 pa-2>
                    <v-card>
                      <v-img
                        src="https://cdn.vuetifyjs.com/images/cards/desert.jpg"
                        aspect-ratio="2.75"
                      ></v-img>
                      <v-card-title primary-title>
                        <div>
                          <h3 class="headline mb-0">Communicative planning</h3>
                        </div>
                      </v-card-title>
                      <v-card-text>
                        Communicative planning is an approach to urban planning that gathers stakeholders and engages them in a process to make decisions together in a manner that respects the positions of all involved. It is also sometimes called collaborative planning among planning practitioners or collaborative planning model.
                      </v-card-text>
                    </v-card>
                  </v-flex>
                  <v-flex xs6 pa-2>
                    <v-card>
                      <v-img
                        src="https://cdn.vuetifyjs.com/images/cards/desert.jpg"
                        aspect-ratio="2.75"
                      ></v-img>
                      <v-card-title primary-title>
                        <div>
                          <h3 class="headline mb-0">Participatory planning</h3>
                        </div>
                      </v-card-title>
                      <v-card-text>
                        Participatory planning is an urban planning paradigm that emphasizes involving the entire community in the strategic and management processes of urban planning; or, community-level planning processes, urban or rural. It is often considered as part of community development. Participatory planning aims to harmonize views among all of its participants as well as prevent conflict between opposing parties. In addition, marginalized groups have an opportunity to participate in the planning process.
                      </v-card-text>
                    </v-card>
                  </v-flex>
                  <v-flex xs6 pa-2>
                    <v-card>
                      <v-img
                        src="https://cdn.vuetifyjs.com/images/cards/desert.jpg"
                        aspect-ratio="2.75"
                      ></v-img>
                      <v-card-title primary-title>
                        <div>
                          <h3 class="headline mb-0">Transactive planning</h3>
                        </div>
                      </v-card-title>
                      <v-card-text>
                        Transactive planning was a radical break from previous models. Instead of considering public participation as method that would be used in addition to the normal training planning process, participation was a central goal. For the first time, the public was encouraged to take on an active role in the policy setting process, while the planner took on the role of a distributor of information and a feedback source. Transactive planning focuses on interpersonal dialogue that develops ideas, which will be turned into action. One of the central goals is mutual learning where the planner gets more information on the community and citizens become more educated about planning issues.
                      </v-card-text>
                    </v-card>
                  </v-flex>
                  <v-flex xs6 pa-2>
                    <v-card>
                      <v-img
                        src="https://cdn.vuetifyjs.com/images/cards/desert.jpg"
                        aspect-ratio="2.75"
                      ></v-img>
                      <v-card-title primary-title>
                        <div>
                          <h3 class="headline mb-0">Communicative approach</h3>
                        </div>
                      </v-card-title>
                      <v-card-text>
                        The communicative approach to planning focuses on using communication to help different interests in the process understand each other. The idea is that each individual will approach a conversation with his or her own subjective experience in mind and that from that conservation shared goals and possibilities will emerge. Again, participation plays a central role under this model. The model seeks to include as a broad range of voice to enhance the debate and negotiation that is supposed to form the core of actual plan making. In this model, participation is actually fundamental to the planning process happening. Without the involvement of concerned interests there is no planning.
                      </v-card-text>
                    </v-card>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-flex>

            <v-flex xs6 pl-2 text-xs-center v-if='currentTab.id === 4'>
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
                          <h3 class="headline mb-0">Free plan</h3>
                        </div>
                      </v-card-title>
                      <v-card-text>
                        <v-list>
                          <v-list-tile>
                            <v-list-tile-content>
                              <v-list-tile-title>Limited questionnaires</v-list-tile-title>
                            </v-list-tile-content>
                          </v-list-tile>
                          <v-list-tile>
                            <v-list-tile-content>
                              <v-list-tile-title>Limited storage</v-list-tile-title>
                            </v-list-tile-content>
                          </v-list-tile>
                        </v-list>
                      </v-card-text>
                    </v-card>
                  </v-flex>
                  <v-flex xs6 pa-2>
                    <v-card>
                      <v-img
                        src="https://cdn.vuetifyjs.com/images/cards/desert.jpg"
                        aspect-ratio="2.75"
                      ></v-img>
                      <v-card-title primary-title>
                        <div>
                          <h3 class="headline mb-0">Personal plan</h3>
                        </div>
                      </v-card-title>
                      <v-card-text>
                        <v-list>
                          <v-list-tile>
                            <v-list-tile-content>
                              <v-list-tile-title>Limited questionnaires</v-list-tile-title>
                            </v-list-tile-content>
                          </v-list-tile>
                          <v-list-tile>
                            <v-list-tile-content>
                              <v-list-tile-title>Limited storage</v-list-tile-title>
                            </v-list-tile-content>
                          </v-list-tile>
                        </v-list>
                      </v-card-text>
                    </v-card>
                  </v-flex>
                  <v-flex xs6 pa-2>
                    <v-card>
                      <v-img
                        src="https://cdn.vuetifyjs.com/images/cards/desert.jpg"
                        aspect-ratio="2.75"
                      ></v-img>
                      <v-card-title primary-title>
                        <div>
                          <h3 class="headline mb-0">Premium plan</h3>
                        </div>
                      </v-card-title>
                      <v-card-text>
                        <v-list>
                          <v-list-tile>
                            <v-list-tile-content>
                              <v-list-tile-title>Limited questionnaires</v-list-tile-title>
                            </v-list-tile-content>
                          </v-list-tile>
                          <v-list-tile>
                            <v-list-tile-content>
                              <v-list-tile-title>Limited storage</v-list-tile-title>
                            </v-list-tile-content>
                          </v-list-tile>
                        </v-list>
                      </v-card-text>
                    </v-card>
                  </v-flex>
                  <v-flex xs6 pa-2>
                    <v-card>
                      <v-img
                        src="https://cdn.vuetifyjs.com/images/cards/desert.jpg"
                        aspect-ratio="2.75"
                      ></v-img>
                      <v-card-title primary-title>
                        <div>
                          <h3 class="headline mb-0">Custom build</h3>
                        </div>
                      </v-card-title>
                      <v-card-text>
                        <v-list>
                          <v-list-tile>
                            <v-list-tile-content>
                              <v-list-tile-title>Limited questionnaires</v-list-tile-title>
                            </v-list-tile-content>
                          </v-list-tile>
                          <v-list-tile>
                            <v-list-tile-content>
                              <v-list-tile-title>Limited storage</v-list-tile-title>
                            </v-list-tile-content>
                          </v-list-tile>
                        </v-list>
                      </v-card-text>
                    </v-card>
                  </v-flex>
                </v-layout>
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

export default {
  data() {
    return {
      currentTab: { id: 1, title: 'What is Geobabel?!' },
      tabs: [
        { id: 1, title: 'What is Geobabel?' },
        { id: 2, title: 'Features' },
        { id: 3, title: 'Use cases' },
        { id: 4, title: 'Pricing' },
        { id: 5, title: 'Contact us' },
        { id: 6, title: 'Case studies' },
      ],
    };
  },
  components: {
    meetingTable,
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
