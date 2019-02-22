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
                :value="radio"
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
                <v-btn small fab dark class="indigo">
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
            title: 'text',
            description: 'label',
            value: null,
            items: [1, 2, 4, 5, 8],
          },
          { id: 'question3',
            type: 'checkboxGroup',
            page: '2',
            title: 'check1',
            description: 'check1',
            value: null,
            checkboxes: [
              { id: 'c1', label: 'testlabels1', value: false },
              { id: 'c2', label: 'testlabels2', value: false },
              { id: 'c3', label: 'testlabels3', value: false },
            ],
          },
          { id: 'question4',
            type: 'radioGroup',
            page: '2',
            title: 'Lorem ipsum',
            description: 'radio1',
            value: null,
            radios: [
              { id: 'r1', label: 'radio 1', radioValue: false },
              { id: 'r2', label: 'radio 2', radioValue: false },
              { id: 'r3', label: 'radio 3', radioValue: false },
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
        ],
      },
    };
  },
  methods: {
    addRow(question) {
      if (question.lines.length < 21) {
        question.lines.push({ id: 1, value: null, coords: [] });
      }
    },
    getValues() {
      this.questionnaire.questions.forEach((q) => {
        if (q.type === 'textfield') {
          console.log(q.title, q.value);
        }
        if (q.type === 'combobox') {
          console.log(q.title, q.value);
        }
        if (q.type === 'checkboxGroup') {
          q.checkboxes.forEach((c) => {
            console.log(c.label, c.value);
          });
        }
        if (q.type === 'radioGroup') {
          q.radios.forEach((r) => {
            console.log(r.label, r.radioValue);
          });
        }
        if (q.type === 'mapPointer') {
          console.log(q.title, q.value);
        }
        if (q.type === 'mapPointerMultiple') {
          console.log(q.title, q.value);
        }
      });
    },
    getFromMap(id, type) {
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
