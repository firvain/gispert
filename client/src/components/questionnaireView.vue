<template>
  <v-layout row wrap xs12 sm12 md12>
      
      <v-container fluid row v-for="item in questionnaire.properties.introduction.items" :key="item.id">
        <h3 v-if="item.type === 'heading'" class="headline mb-0">{{ item.value }}</h3>
        <div v-if="item.type === 'text'" > {{ item.value }} </div>
        <img v-if="item.type === 'image'" :src="item.value" aspect-ratio="2.75"/>
      </v-container>

      <v-container pa-1 ma-1 row v-for="question in questionnaire.questions" :key="question.id">

        <v-card>
          <v-card-title primary-title>
            <div>
              <h3 class="headline mb-0">{{ question.title }}</h3>
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
            <v-radio-group v-model="question.value">
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
      <v-btn dark class="indigo" @click="getValues">
        ΥΠΟΒΟΛΗ ΕΡΩΤΗΜΑΤΟΛΟΓΙΟΥ<v-icon dark>send</v-icon>
      </v-btn>
  </v-layout>
</template>
<script>
import ol from 'openlayers';
import olMap from '../js/map';

export default {
  data() {
    return {
      questionnaire: {
        properties: {
          mongoid: 'fjdkslajfsdkgjeio111',
          mapExtent: [],
          loginRequired: false,
          introduction: {
            items: [
              { id: 1, type: 'heading', value: 'Εντοπισμός προβλημάτων' },
              { id: 2, type: 'text', value: 'περιγραφή του ερωτηματολογίου' },
              { id: 3, type: 'image', value: 'https://cdn.vuetifyjs.com/images/cards/desert.jpg' },
              { id: 4, type: 'text', value: 'περιγραφή της εικόνας' },
            ],
          },
        },
        questions: [
          { id: 'question1',
            type: 'textfield',
            page: '1',
            title: 'Γράψε μια διασταύρωση που ειναι επικίνδυνη',
            description: 'label',
            image: 'https://cdn.vuetifyjs.com/images/cards/desert.jpg',
            value: null,
          },
          { id: 'question2',
            type: 'combobox',
            page: '2',
            title: 'Πόσα αυτοκίνητα διαθέτει το νοικοκυριό σας;',
            description: 'Διαλέξτε από τη λίστα',
            value: null,
            items: [0, 1, 2, 3, 4],
          },
          { id: 'question3',
            type: 'checkboxGroup',
            page: '2',
            title: 'Πότε μετακινήστε προς το κέντρο της πόλης;',
            description: 'Διαλέξτε ένα ή περισσότερα από τα παρακάτω',
            value: null,
            checkboxes: [
              { id: 'c1', label: 'Καθημερινές', value: false },
              { id: 'c2', label: 'Σαββατοκύριακο', value: false },
            ],
          },
          { id: 'question4',
            type: 'radioGroup',
            page: '2',
            title: 'Ποιον τρόπο μετακίνησης προτιμάτε;',
            description: 'Διαλέξτε ένα από τα παρακάτω',
            value: null,
            radios: [
              { id: 'r1', label: 'Αυτοκίνητο', radioValue: false },
              { id: 'r2', label: 'Λεωφορείο', radioValue: false },
              { id: 'r3', label: 'Πεζή', radioValue: false },
              { id: 'r4', label: 'Ποδήλατο', radioValue: false },
            ],
          },
          { id: 'question5',
            type: 'mapPointer',
            page: '2',
            title: 'Βάλε στο χάρτη την αφετηρία και τον προορισμό για τον χώρο εργασίας σας',
            description: 'Πατήστε πάνω στο χάρτη με όση ακρίβεια θέλετε. Πατήστε το κουμπί και μετά πάνω στο χάρτη',
            value: [],
            buttons: [
              { id: 'g1', label: 'Αφετηρία', coords: null },
              { id: 'g2', label: 'Προορισμός', coords: null },
            ],
          },
          { id: 'question6',
            type: 'mapPointerMultiple',
            page: '2',
            title: 'Εντοπισμός προβλημάτων για πεζή μετακίνηση',
            description: 'Προαιρετικά μπορείτε να δείξετε στον χάρτη πατώντας το κουμπί και μετά πάνω στο χάρτη',
            lines: [
              { id: 'f1', value: null, coords: null },
            ],
          },
          { id: 'question7',
            type: 'mapPointerMultiple',
            page: '2',
            title: 'Εντοπισμός σημείων ατυχημάτων',
            description: 'Σημειώστε τον λόγο που γίνονται ατυχήματα και δείξτε στον χάρτη πατώντας το κουμπί και μετά πάνω στο χάρτη',
            lines: [
              { id: 'mpm1', value: null, coords: null },
            ],
          },
        ],
      },
    };
  },
  methods: {
    addRow(question) {
      if (question.lines.length < 21) {
        question.lines.push({ id: `question.id${question.lines.length + 1}`, value: null, coords: [] });
      }
      console.log(`question.id${question.lines.length + 1}`);
    },
    getValues() {
      const questionnaireResult = [];
      this.questionnaire.questions.forEach((q) => {
        if (q.type === 'textfield') {
          questionnaireResult.push({
            id: q.id,
            title: q.title,
            value: q.value,
          });
        }
        if (q.type === 'combobox') {
          questionnaireResult.push({
            id: q.id,
            title: q.title,
            value: q.value,
          });
        }
        if (q.type === 'checkboxGroup') {
          const boxes = [];
          q.checkboxes.forEach((c) => {
            boxes.push([c.label, c.value]);
          });
          questionnaireResult.push({
            id: q.id,
            title: q.title,
            value: boxes,
          });
        }
        if (q.type === 'radioGroup') {
          questionnaireResult.push({
            id: q.id,
            title: q.title,
            value: q.value,
          });
        }
        if (q.type === 'mapPointer') {
          let coordinates = null;
          q.buttons.forEach((b) => {
            const features = this.$store.state.questionnaireFeatures;
            features.forEach((f) => {
              if (f.getProperties().buttonId === b.id) {
                coordinates = f;
              }
            });
          });
          questionnaireResult.push({
            id: q.id,
            title: q.title,
            value: coordinates,
          });
        }
        if (q.type === 'mapPointerMultiple') {
          const coordinates = [];
          q.lines.forEach((b) => {
            const features = this.$store.state.questionnaireFeatures;
            features.forEach((f) => {
              if (f.getProperties().buttonId === b.id) {
                coordinates.push(f);
              }
            });
          });
          questionnaireResult.push({
            id: q.id,
            title: q.title,
            value: coordinates,
          });
          console.log(q.id, q.title, q.value);
        }
      });
      console.log('result:: ', questionnaireResult);
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
        if (type === 'Point') {
          this.toolColors = ['green', 'grey', 'grey', 'grey', 'grey'];
        }
        if (type === 'LineString') {
          this.toolColors = ['grey', 'green', 'grey', 'grey', 'grey'];
        }
        if (type === 'Polygon') {
          this.toolColors = ['grey', 'grey', 'green', 'grey', 'grey'];
        }
        if (interaction instanceof ol.interaction.Draw) {
          if (interaction.getProperties().name === type) {
            interaction.setActive(true);
            // this.selectedTool = 'drawFeatures';
          } else {
            interaction.setActive(false);
          }
        }
      });
    },
  },
  mounted() {
    this.$store.commit('setQuestionnaireMode', true);
  },
};
</script>
