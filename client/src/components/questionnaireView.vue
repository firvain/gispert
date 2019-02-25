<template>
  <v-layout row wrap xs12 sm12 md12>
    <div v-if="page === 0">
      <v-container fluid row
        v-for="item in questionnaire.properties.introduction.items"
        :key="item.id"
      >
        <h3 v-if="item.type === 'heading'" class="headline mb-0">{{ item.value }}</h3>
        <div v-if="item.type === 'text'" > {{ item.value }} </div>
        <img v-if="item.type === 'image'" :src="item.value" aspect-ratio="2.75"/>
      </v-container>
    </div>

      <v-container pa-1 ma-1 row v-for="question in questionnaire.questions" :key="question.id">

        <v-card v-if="question.page === page">
          <v-card-title primary-title>
            <div>
              <h3 class="headline mb-0">{{ question.title }}</h3>
              <v-alert color="error" icon="warning" :value="question.error">
                Δεν έχετε απαντήσει στην ερώτηση
              </v-alert>
              <div> {{ question.description }} </div>
            </div>
          </v-card-title>
          <img
            v-if="question.image"
            :src="question.image"
            aspect-ratio="2.75"
          />
          <v-card-text>

          <v-flex v-if="question.type === 'textfield'">
            <v-text-field
              name="input-1"
              v-model="question.value"
              label="Η απάντησή σας"
            ></v-text-field>
          </v-flex>

          <v-flex v-if="question.type === 'combobox'">{{ question.text }}
            <v-select
              v-bind:items="question.items"
              v-model="question.value"
              label="Η απάντησή σας"
              single-line
              bottom
            ></v-select>
          </v-flex>

          <v-container row wrap v-if="question.type === 'checkboxGroup'">
              <v-flex v-for="checkbox in question.checkboxes" :key="checkbox.id">
                <v-checkbox
                  :label="checkbox.label"
                  v-model="checkbox.value"
                  :value="checkbox.value">
                </v-checkbox>
              </v-flex>
          </v-container>

          <v-container row wrap v-if="question.type === 'radioGroup'">
            <v-radio-group v-model="question.value" mandatory>
              <v-radio
                v-for="radio in question.radios"
                :key="radio.id"
                :label="`${radio.label}`"
                :value="radio.label"
              ></v-radio>
            </v-radio-group>
          </v-container>

          <v-container row wrap v-if="question.type === 'mapPointer'">
            <v-flex v-for="button in question.buttons" :key="button.id">{{ button.label }}
              <v-btn small fab dark class="indigo" @click="getFromMap(button.id, 'Point')">
                <v-icon dark>location_on</v-icon>
              </v-btn>
            </v-flex>
          </v-container>

          <v-container v-if="question.type === 'mapPointerMultiple'">
            <v-layout row wrap v-for="line in question.lines" :key="line.id">
              <v-flex xs10>
                <v-text-field
                  name="input-1"
                  v-model="line.value"
                  label="Η απάντησή σας"
                ></v-text-field>
              </v-flex>
              <v-flex xs2>
                <v-btn small fab dark class="indigo" @click="getFromMap(line.id, 'Point')">
                  <v-icon dark>location_on</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
            <v-btn dark class="indigo" @click="addRow(question)">
              Προσθήκη γραμμής
            </v-btn>
          </v-container>

          </v-card-text>
        </v-card>
      </v-container>

      <v-btn dark class="indigo" @click="submit('page');" v-if="page < questionnaire.properties.pages">
        Επόμενη Ενότητα >> <span v-if="page > 0"> &nbsp; {{ page }} / {{ questionnaire.properties.pages }}</span>
      </v-btn>

      <v-btn dark class="indigo" @click="submit('all')" v-if="page === questionnaire.properties.pages">
        ΥΠΟΒΟΛΗ ΕΡΩΤΗΜΑΤΟΛΟΓΙΟΥ<v-icon dark>send</v-icon>
      </v-btn>

      <v-snackbar
        :timeout=5000
        v-model="snackbarError"
        color= "red"
      >Υπάρχουν σφάλματα. Δείτε τις ερωτήσεις που έχουν σημανθεί με κόκκινο</v-snackbar>

      <v-alert color="success" icon="check_circle" :value="submitted">
        Οι απαντήσεις σας καταχωρίστηκαν επιτυχώς.
      </v-alert>
  </v-layout>
</template>
<script>
import ol from 'openlayers';
import olMap from '../js/map';

export default {
  data() {
    return {
      snackbarError: false,
      submitted: false,
      page: 0,
      questionnaire: {
        properties: {
          mongoid: 'fjdkslajfsdkgjeio111',
          mapExtent: [2454240, 4982105, 2455240, 4985095],
          loginRequired: false,
          pages: 3,
          introduction: {
            items: [
              { id: 1, type: 'heading', value: 'Ερωτηματολόγιο για εντοπισμό προβλημάτων' },
              { id: 2, type: 'text', value: 'Αυτό το ερωτηματολόγιο έχει σκοπό να συλλέξει τα προβλήματα που εμφανίζονται στις μετακινήσεις των πολιτών στην πόλη των Τρικάλων' },
              { id: 3, type: 'image', value: 'https://cdn.vuetifyjs.com/images/cards/desert.jpg' },
              { id: 4, type: 'text', value: 'Συμπληρώστε το ερωτηματολόγιο σύμφωνα με τις οδηγίες κάθε ερώτησης. Στις ερωτήσεις που χρειάζεται να δείξετε πάνω στον χάρτη πατήστε το μπλε κουμπί και μετά πάνω στο χάρτη. Αν θέλετε να διορθώσετε τη θέση που δείξατε επαναλάβετε τη διαδικασία' },
            ],
          },
        },
        questions: [
          { id: 'question11',
            type: 'textfield',
            page: 0,
            title: 'Ονοματεπώνυμο',
            description: 'Το όνομα και το επώνυμό σας',
            value: null,
            error: false,
          },
          { id: 'question12',
            type: 'textfield',
            page: 0,
            title: 'Φορέας',
            description: 'Ο φορέας που εκπροσωπείτε. Αν όχι σημειώστε παύλα ή κανένας',
            value: null,
            error: false,
          },
          { id: 'question13',
            type: 'textfield',
            page: 0,
            title: 'email',
            description: 'Η διεύθυνση ηλεκτρονικού ταχυδρομείου σας',
            value: null,
            error: false,
          },
          { id: 'question1',
            type: 'textfield',
            page: 1,
            title: 'Γράψε μια διασταύρωση που ειναι επικίνδυνη',
            description: 'label',
            image: 'https://cdn.vuetifyjs.com/images/cards/desert.jpg',
            value: null,
            error: false,
          },
          { id: 'question2',
            type: 'combobox',
            page: 1,
            title: 'Πόσα αυτοκίνητα διαθέτει το νοικοκυριό σας;',
            description: 'Διαλέξτε από τη λίστα',
            value: null,
            items: [0, 1, 2, 3, 4],
            error: false,
          },
          { id: 'question3',
            type: 'checkboxGroup',
            page: 1,
            title: 'Πότε μετακινήστε προς το κέντρο της πόλης;',
            description: 'Διαλέξτε ένα ή περισσότερα από τα παρακάτω',
            value: null,
            checkboxes: [
              { id: 'c1', label: 'Καθημερινές', value: false },
              { id: 'c2', label: 'Σαββατοκύριακο', value: false },
            ],
            error: false,
          },
          { id: 'question4',
            type: 'radioGroup',
            page: 2,
            title: 'Ποιον τρόπο μετακίνησης προτιμάτε;',
            description: 'Διαλέξτε ένα από τα παρακάτω',
            value: null,
            radios: [
              { id: 'r1', label: 'Αυτοκίνητο', radioValue: true },
              { id: 'r2', label: 'Λεωφορείο', radioValue: false },
              { id: 'r3', label: 'Πεζή', radioValue: false },
              { id: 'r4', label: 'Ποδήλατο', radioValue: false },
            ],
            error: false,
          },
          { id: 'question5',
            type: 'mapPointer',
            page: 2,
            title: 'Βάλε στο χάρτη την αφετηρία και τον προορισμό για τον χώρο εργασίας σας',
            description: 'Πατήστε πάνω στο χάρτη με όση ακρίβεια θέλετε. Πατήστε το κουμπί και μετά πάνω στο χάρτη',
            value: [],
            buttons: [
              { id: 'g1', label: 'Αφετηρία', coords: null },
              { id: 'g2', label: 'Προορισμός', coords: null },
            ],
            error: false,
          },
          { id: 'question6',
            type: 'mapPointerMultiple',
            page: 3,
            title: 'Εντοπισμός προβλημάτων για πεζή μετακίνηση',
            description: 'Γράψτε την περιγραφή του προβλήματος και μετά δείξτε που το εντοπίζεται στον χάρτη πατώντας το μπλε κουμπί και μετά πάνω στο χάρτη. Για διόρθωση της θέσης ξαναπατήστε το μπλε κουμπί και μετά στη σωστή θέση. Αν προσθέσατε μια κενή γραμμή που δεν χρειάζεστε αφήστε την κενή.',
            lines: [
              { id: 'f1', value: null, coords: null },
            ],
            error: false,
          },
          { id: 'question7',
            type: 'mapPointerMultiple',
            page: 3,
            title: 'Εντοπισμός σημείων ατυχημάτων',
            description: 'Σημειώστε τον λόγο που γίνονται ατυχήματα και δείξτε που εντοπίζεται στον χάρτη πατώντας το κουμπί και μετά πάνω στο χάρτη. Για διόρθωση της θέσης ξαναπατήστε το μπλε κουμπί και μετά στη σωστή θέση. Αν προσθέσατε μια κενή γραμμή που δεν χρειάζεστε αφήστε την κενή.',
            lines: [
              { id: 'mpm1', value: null, coords: null },
            ],
            error: false,
          },
        ],
      },
    };
  },
  methods: {
    async validate(questionnaire) {
      let error = false;
      questionnaire.forEach((q) => {
        if (q.error) {
          console.log('there is error in ::: ', q.id);
          const objIndex =
            this.questionnaire.questions.findIndex((obj => obj.id === q.id));
          this.questionnaire.questions[objIndex].error
            = true; // eslint-disable-line no-param-reassign
          error = true;
        } else {
          const objIndex =
            this.questionnaire.questions.findIndex((obj => obj.id === q.id));
          this.questionnaire.questions[objIndex].error
            = false; // eslint-disable-line no-param-reassign
        }
      });
      console.log(!error);
      return !error;
    },
    addRow(question) {
      if (question.lines.length < 21) {
        question.lines.push({ id: `${question.id}${question.lines.length + 1}`, value: null, coords: [] });
      }
      console.log(`added this id:: ${question.id}${question.lines.length + 1}`);
    },
    async getValues() {
      const questionnaireResult = [];
      this.questionnaire.questions.forEach((q) => {
        if (q.page === this.page) {
          if (q.type === 'textfield') {
            if (q.value && q.value.length > 0) {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: q.value,
                error: false,
              });
            } else {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: q.value,
                error: true,
              });
            }
          }
          if (q.type === 'combobox') {
            if (q.value !== null) {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: q.value,
                error: false,
              });
            } else {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: q.value,
                error: true,
              });
            }
          }
          if (q.type === 'checkboxGroup') {
            const boxes = [];
            const errors = [];
            q.checkboxes.forEach((c) => {
              errors.push(c.value);
            });
            q.checkboxes.forEach((c) => {
              boxes.push([c.label, c.value]);
            });
            if (errors.includes(true)) {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: boxes,
                error: false,
              });
            } else {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: boxes,
                error: true,
              });
            }
          }
          if (q.type === 'radioGroup') {
            if (q.value) {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: q.value,
                error: false,
              });
            } else {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: q.value,
                error: true,
              });
            }
          }
          if (q.type === 'mapPointer') {
            const coordinates = [];
            q.buttons.forEach((b) => {
              const features = this.$store.state.questionnaireFeatures;
              features.forEach((f) => {
                if (f.getProperties().buttonId === b.id) {
                  coordinates.push(f);
                }
              });
            });
            if (coordinates.length === 2) {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: coordinates,
                error: false,
              });
            } else {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: coordinates,
                error: true,
              });
            }
          }
          if (q.type === 'mapPointerMultiple') {
            const coordinates = [];
            const values = [];
            q.lines.forEach((b) => {
              console.log('b:: ', b);
              if (b.value) {
                values.push(b.value);
                const features = this.$store.state.questionnaireFeatures;
                features.forEach((f) => {
                  if (f.getProperties().buttonId === b.id) {
                    coordinates.push(f);
                  }
                });
              }
            });
            if (values.length > 0 && coordinates.length > 0) {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: values,
                coordinates: coordinates,
                error: false,
              });
            } else {
              questionnaireResult.push({
                id: q.id,
                title: q.title,
                value: values,
                coordinates: coordinates,
                error: true,
              });
            }
            console.log(q.id, q.title, q.value);
          }
        }
      });
      console.log('result:: ', questionnaireResult);
      return questionnaireResult;
    },
    async getAllValues() {
      const questionnaireResult = [];
      this.questionnaire.questions.forEach((q) => {
        if (q.type === 'textfield') {
          if (q.value && q.value.length > 0) {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: q.value,
              error: false,
            });
          } else {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: q.value,
              error: true,
            });
          }
        }
        if (q.type === 'combobox') {
          if (q.value !== null) {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: q.value,
              error: false,
            });
          } else {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: q.value,
              error: true,
            });
          }
        }
        if (q.type === 'checkboxGroup') {
          const boxes = [];
          const errors = [];
          q.checkboxes.forEach((c) => {
            errors.push(c.value);
          });
          q.checkboxes.forEach((c) => {
            boxes.push([c.label, c.value]);
          });
          if (errors.includes(true)) {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: boxes,
              error: false,
            });
          } else {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: boxes,
              error: true,
            });
          }
        }
        if (q.type === 'radioGroup') {
          if (q.value) {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: q.value,
              error: false,
            });
          } else {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: q.value,
              error: true,
            });
          }
        }
        if (q.type === 'mapPointer') {
          const coordinates = [];
          q.buttons.forEach((b) => {
            const features = this.$store.state.questionnaireFeatures;
            features.forEach((f) => {
              if (f.getProperties().buttonId === b.id) {
                coordinates.push(f);
              }
            });
          });
          if (coordinates.length === 2) {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: coordinates,
              error: false,
            });
          } else {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: coordinates,
              error: true,
            });
          }
        }
        if (q.type === 'mapPointerMultiple') {
          const coordinates = [];
          const values = [];
          q.lines.forEach((b) => {
            console.log('b:: ', b);
            if (b.value) {
              values.push(b.value);
              const features = this.$store.state.questionnaireFeatures;
              features.forEach((f) => {
                if (f.getProperties().buttonId === b.id) {
                  coordinates.push(f);
                }
              });
            }
          });
          if (values.length > 0 && coordinates.length > 0) {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: values,
              coordinates: coordinates,
              error: false,
            });
          } else {
            questionnaireResult.push({
              id: q.id,
              title: q.title,
              value: values,
              coordinates: coordinates,
              error: true,
            });
          }
          console.log(q.id, q.title, q.value);
        }
      });
      console.log('result:: ', questionnaireResult);
      return questionnaireResult;
    },
    getFromMap(id, type) {
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach((layer) => {
        if (layer.getProperties().name === 'customLayer') {
          layer.getSource().forEachFeature((feature) => {
            if (feature.get('buttonId') === id) {
              layer.getSource().removeFeature(feature);
            }
          });
        }
      });

      this.$store.commit('setQuestionnaireFeatureId', id);
      olMap.getInteractions().forEach((interaction) => {
        if (interaction instanceof ol.interaction.Draw) {
          if (interaction.getProperties().name === type) {
            interaction.setActive(true);
          } else {
            interaction.setActive(false);
          }
        }
      });
    },
    submit(type) {
      this.getValues().then((res) => {
        this.validate(res).then((v) => {
          if (v) {
            console.log('next page', v);
            this.page += 1;
            if (type === 'all') {
              this.getAllValues().then((result) => {
                console.log('send to server', result);
                this.submitted = true;
                this.$store.commit('resetQuestionnaire');
              });
            }
          } else {
            console.log('show the error', v);
            this.snackbarError = true;
          }
        });
      });
    },
    zoomToExtent() {
      const g = this.questionnaire.properties.mapExtent;
      olMap.getView().fit(g, olMap.getSize());
    },
  },
  mounted() {
    this.$store.commit('setQuestionnaireMode', true);
    this.zoomToExtent();
  },
};
</script>
