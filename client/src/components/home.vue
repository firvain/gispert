<template>
  <div id="maincontainer">
    <v-toolbar class="orange lighten-2 no-padding" dark>
      <i class="fa fa-map fa-2x"></i><h4>Geobabel</h4><p>Terra Cognita</p>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat @click="scrollTo('useCases')">
          Use cases
        </v-btn>
        <v-btn flat @click="scrollTo('features')">
          Features
        </v-btn>
        <v-btn flat target="">
          Pricing
        </v-btn>
        <v-btn flat @click="scrollTo('contactus')">
          Contact us
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-layout row wrap>
      <v-flex>
      <v-parallax xs12 md12 src="../static/images/abstract-adult-background-1079033.jpg" height="400">
        <v-layout column align-center justify-center>
          <h1 class="orange--text inImage">Geobabel</h1>
          <h2 class="orange--text inImage">Innovation in citizen engagement!</h2>
        </v-layout>
      </v-parallax>
      </v-flex>
      <v-flex sx12 sm12 md12>
        <v-layout ma-4 pa-4 column align-center justify-center>
          <h2>What is Geobabel?</h2>
          <h4 class="heading text-md-center">
            Geobabel is a web based survey tool for citizen engagement. Brings together local authorities, citizens, planners or researchers on the same table to
            discuss and give feedback to each other, resulting in more participatory decision making and substantive public participation.
          </h4>
          <h4 class="heading text-md-center">
            Geobabel combines simply and effective the questionnaires with the map as well as the social media functions with the map.
          </h4>
        </v-layout>
        <v-layout wrap pa-4 ma-4>
          <v-flex d-flex xs4>
            <v-card color="orange" class="white--text">
              <v-container fluid grid-list-md box>
                <v-layout row>
                  <v-flex xs7>
                    <div>
                      <div class="headline">Questionnaire editor</div>
                      <div>usual questions and questions requiring map data.</div>
                    </div>
                    <v-card-actions>
                      <v-btn flat color="white">Try editor</v-btn>
                    </v-card-actions>
                  </v-flex>
                  <v-flex xs5>
                      <v-card-media
                        src="../static/images/depth-of-field-direction-finger-34753.jpg"
                        height="125px"
                        contain
                      ></v-card-media>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-flex>
          <v-flex d-flex xs4>
            <v-card>
              <v-container fluid grid-list-md box>
                <v-layout row>
                  <v-flex xs7>
                    <div>
                      <div class="headline">Questionnaire results viewer</div>
                      <div>tables, charts and maps for the collected data.</div>
                    </div>
                    <v-card-actions>
                      <v-btn flat color="white" to="/questionnaireResults/5c7651b839592ae5bec5f468">See example results</v-btn>
                    </v-card-actions>
                  </v-flex>
                  <v-flex xs5>
                      <v-card-media
                        src="../static/images/blank-charts-computer-669619.jpg"
                        height="125px"
                        contain
                      ></v-card-media>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-flex>
          <v-flex d-flex xs4>
            <v-card color="orange" class="white--text">
              <v-container fluid grid-list-md box>
                <v-layout row>
                  <v-flex xs7>
                    <div>
                      <div class="headline">Geo-social media as a geo-blogging service</div>
                      <div>structrured discussions using posts, combining text, images, videos and map data.</div>
                    </div>
                    <v-card-actions>
                      <v-btn flat color="white" to="/">Join the geo-social media platform</v-btn>
                    </v-card-actions>
                  </v-flex>
                  <v-flex xs5>
                      <v-card-media
                        src="../static/images/adult-book-business-297755.jpg"
                        height="125px"
                        contain
                      ></v-card-media>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-flex>
        </v-layout>
        
        <v-layout ma-4 pa-4 column align-center justify-center id='features'>
          <h2 class="">How Geobabel works?</h2>
        </v-layout>
        <v-layout row wrap pa-2 ma-2>
          <v-flex d-flex xs3>
            <v-card>
              <v-card-text>
                <h4>Create questionnaire</h4>
                Create a questionnaire with geo-questions. Geo-questions may have one or more fixed map pointing answer slots. In another form
                participants may add slots to geo-questions to show more places for a question.
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex d-flex xs3>
            <v-card>
              <v-card-text>
                <h4>Publish and share questionnaire</h4>
                As soon as you publish the questionnaire you can share it using the url. You can send it via email or social media!
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex d-flex xs3>
            <v-card>
              <v-card-text>
                <h4>Analyse questionnaire results</h4>
                Create a questionnaire with geo-questions. Geo-questions may have one or more fixed map pointing answer slots. In another form
                participants may add slots to geo-questions to show more places for a question.
              </v-card-text>
            </v-card>
          </v-flex>
          <v-flex d-flex xs3>
            <v-card>
              <v-card-text>
                <h4>Start a discussion</h4>
                Using Geobabel's geo-social media features you can create structured and content rich discussions. Creating posts using text and other media for
                places on the map couldn't be more simple. Discussing about a place by drawing on the map can lead to deep insights about the place, its people
                and make smarter, more effective, decisions.
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>

        <v-layout ma-4 pa-4 column align-center justify-center>
          <v-expansion-panel>
            <v-expansion-panel-content
              v-for="(item,i) in demoItems"
              :key="i"
            >
              <template v-slot:header>
                <h3>{{ item.header }}</h3>
              </template>
              <v-card>
                <v-card-text>
                  <v-card-media
                    :src="item.source"
                    :height="item.height"
                    contain
                  ></v-card-media>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-layout>

        <v-layout ma-4 pa-4 column align-center justify-center id='useCases'>
          <h2 class="">Use cases</h2>
          <h4>
          Geobabel is suitable for all different kinds of citizen participation in planning processes:
          </h4>
        </v-layout>
      </v-flex>
      <v-layout row wrap pa-2 ma-2>
        <v-flex d-flex xs3>
          <v-card>
            <v-card-text>
              <h4>Communicative planning</h4>
              Communicative planning is an approach to urban planning that gathers stakeholders and engages them in a process to make decisions together 
              in a manner that respects the positions of all involved. It is also sometimes called collaborative planning among planning practitioners 
              or collaborative planning model.
              <a class="caption" target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Theories_of_urban_planning">Wikipedia</a>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex d-flex xs3>
          <v-card>
            <v-card-text>
              <h4>Participatory planning</h4>
              Participatory planning is an urban planning paradigm that emphasizes involving the entire community in the strategic and management processes 
              of urban planning; or, community-level planning processes, urban or rural. It is often considered as part of community development. Participatory 
              planning aims to harmonize views among all of its participants as well as prevent conflict between opposing parties. In addition, marginalized 
              groups have an opportunity to participate in the planning process.
              <a class="caption" target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Theories_of_urban_planning">Wikipedia</a>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex d-flex xs3>
          <v-card>
            <v-card-text>
              <h4>Transactive planning</h4>
              Transactive planning was a radical break from previous models. Instead of considering public participation as method that would be used in 
              addition to the normal training planning process, participation was a central goal. For the first time, the public was encouraged to take on 
              an active role in the policy setting process, while the planner took on the role of a distributor of information and a feedback source. 
              Transactive planning focuses on interpersonal dialogue that develops ideas, which will be turned into action. One of the central goals is mutual 
              learning where the planner gets more information on the community and citizens become more educated about planning issues.
              <a class="caption" target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Theories_of_urban_planning">Wikipedia</a>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex d-flex xs3>
          <v-card>
            <v-card-text>
              <h4>Communicative approach</h4>
              The communicative approach to planning focuses on using communication to help different interests in the process understand each other. The idea is that each individual will 
              approach a conversation with his or her own subjective experience in mind and that from that conservation shared goals and possibilities 
              will emerge. Again, participation plays a central role under this model. The model seeks to include as a broad range of voice to enhance 
              the debate and negotiation that is supposed to form the core of actual plan making. In this model, participation is actually fundamental 
              to the planning process happening. Without the involvement of concerned interests there is no planning.
              <a class="caption" target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Theories_of_urban_planning">Wikipedia</a>
            </v-card-text>
          </v-card>
        </v-flex>     
      </v-layout>

      <v-carousel>
        <v-carousel-item v-for="(item,i) in items" v-bind:src="item.src" :key="i"></v-carousel-item>
      </v-carousel>
    </v-layout>

    <v-layout align-center justify-center row pa-4 ma-4 id='contactus'>
      <v-flex xs3>
        <v-card>
          <v-card-text>
            <h1>Contact us</h1>
            <h3>Terra Cognita</h3>
            <h4>Lechovou 3</h4>
            <h4>GR-501 31 Kozani</h4>
            <h4>Greece</h4>
            <p>info@terracognita.eu</p>
            <a class="caption" target="_blank" rel="noopener noreferrer" href="http://terracognita.eu/what-we-do/contact-us/">Terra Cognita</a>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>


    <v-footer class="pa-0">
      <a flat @click='termsOfUseDialog = true'>Όροι χρήσης</a>
      <v-spacer></v-spacer>
      <div>Terra Cognita Ltd, All rights reserved. © {{ new Date().getFullYear() }}</div>
    </v-footer>
      <v-dialog v-model="termsOfUseDialog" max-width="500px">
        <v-card>
          <v-card-title>
            <h5>Όροι χρήσης</h5>
          </v-card-title>
          <v-card-text>
            Με την εγγραφή ο χρήστης αποδέχεται πλήρως και ανεπιφύλακτα τους παρακάτω Όρους Χρήσης της Πλατφόρμας:
            <li>
            Οι καταχωρήσεις των σχολίων και ιδεών αποτελούν προσωπικές ιδέες ή εμπειρίες των συγγραφέων τους (χρηστών), 
            και όχι απόψεις των Διαχειριστών της πλατφόρμας
            </li>
            <li>
            Τα προσωπικά δεδομένα των χρηστών δεν χρησιμοποιούνται για οποιοδήποτε εμπορικό σκοπό ή για επικοινωνία με αυτούς εκτός κι αν παραβιάζονται
            οι Όροι Χρήσης.
            </li>
            <li>
            Ο Χρήστης παραμένει μοναδικός υπεύθυνος για το περιεχόμενο των καταχωρήσεών του. Επιπλέον, είναι υπόλογος για οποιαδήποτε 
            οικονομική ή νομική υποχρέωση προκύψει εξαιτίας της κακής χρήσης της παρούσας υπηρεσίας.
            </li>
            <li>
            Οι Διαχειριστές της πλατφόρμας διατηρούν το δικαίωμα να χρησιμοποιήσουν 
            τα πραγματικά στοιχεία του Χρήστη, σε περίπτωση νομικής δράσης που προκύπτει από χρήση που παραβιάζει τους όρους χρήσης 
            της πλατφόρμας.
            </li>
            <li>
            Οι καταχωρήσεις επισυναπτόμενου υλικού όπως φωτογραφίες σχετικές με την ιδέα που καταθέτει ο χρήστης με 
            την καταχώρησή τους στην πλατφόρμα αποκτούν δικαιώματα δημόσιας χρήσης και διανομής (creativecommons). Με την καταχώρηση 
            υλικού οι φωτογραφίες αποκτούν αυτόματα την άδεια CCBY Αναφορά Δημιουργού (Αυτή η άδεια επιτρέπει στους άλλους να διανέμουν, 
            να αναμειγνύουν, και να δημιουργούν πάνω στο δικό σας έργο, ακόμηκαι εμπορικά, αρκεί να σας πιστώνουν για την αρχική δημιουργία. 
            Άδεια εκχώρησης:https://creativecommons.org/licenses/by/4.0/).
            </li>
            <li>
            Τα υποβληθέντα σχόλια και ιδέες ελέγχονται εν μέρει από τον κεντρικό διαχειριστή της πλατφόρμας. 
            Τα υποβληθέντα σχόλια και ιδέες θα διαγράφονται
            όταν περιέχουν υβριστικό περιεχόμενο. Επιπλέον το επισυναπτόμενο υλικό θα διαγράφεται
            αν έχει κατά οιονδήποτε τρόπο την πρόθεση να βλάψει το πρόσωπο, την ιδιωτικότητα, το φύλο, την εθνικότητα, την ιδιωτικότητα κ.ο.κ. 
            οποιουδήποτε υποκειμένου σύμφωνα με την εθνική, ευρωπαική και διεθνή νομοθεσία.
            </li>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" flat @click.stop="termsOfUseDialog=false">{{ $t('message.close')}}</v-btn>
            <v-spacer></v-spacer>
            <div><i>Terra Cognita Ltd, All rights reserved. © {{ new Date().getFullYear() }}</i></div>
          </v-card-actions>
        </v-card>
      </v-dialog>
  </div>
</template>
<script>
export default {
  name: 'home',
  data: () => ({
    termsOfUseDialog: false,
    items: [
      {
        src: '../static/images/blank-charts-computer-669619.jpg',
      },
      {
        src: '../static/images/depth-of-field-direction-finger-34753.jpg',
      },
      {
        src: '../static/images/adult-book-business-297755.jpg',
      },
      {
        src: '../static/images/adventure-city-country-240834.jpg',
      },
    ],
    demoItems: [
      { header: '1. Create questionnaires with location, locale and access options', source: '../static/images/createquestionnaireoptions.png', height: 488 },
      { header: '2. Select the type of question you want to add. You can see the preview as you create the question.', source: '../static/images/questiontypes.png', height: 290 },
      { header: '3. Add a text question', source: '../static/images/textfieldquestion.png', height: 627 },
      { header: '4. Add an expandable menu question', source: '../static/images/comboboxquestion.png', height: 777 },
      { header: '5. Add a question with checkboxes', source: '../static/images/checkboxesquestion.png', height: 725 },
      { header: '6. Add a multiple choice question', source: '../static/images/radioquestion.png', height: 700 },
      { header: '7. Add a question that requires the user to point predefined types of places on the map', source: '../static/images/mappointerquestion.png', height: 714 },
      { header: '8. Add a question that requires the user to point multiple places on the map and describe them', source: '../static/images/multiplemappointerquestion.png', height: 597 },
      { header: '9. Your questionnaire will look like...', source: '../static/images/questionnaireexampleresult.png', height: 857 },
      { header: '10. Share the questionnaire with your target group', source: '../static/images/sharedialog.png', height: 194 },
      { header: '11. Analyze the results using charts', source: '../static/images/chart.png', height: 468 },
      { header: '12. Map the results of the location questions', source: '../static/images/createmapresult.png', height: 615 },
      // { header: '', source: '../static/images/.png', height:  },
    ],
  }),
  components: {
  },
  methods: {
    scrollTo(id) {
      const goToOptions = {
        duration: 500,
        offset: -55,
        easing: 'easeInOutCubic',
      };
      console.log(this.$vuetify);
      this.$vuetify.goTo(`#${id}`, goToOptions);
    },
  },
  mounted() {
  },
};
</script>
<style>
.inImage {
  text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
}
#maincontainer {
  max-height: 100vh;
  /* overflow: scroll; */
}
</style>
