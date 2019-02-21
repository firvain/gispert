<template>
<v-container>
  <v-layout row wrap xs12 sm12 md12>
    <v-flex>
    <v-form>
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
            <v-flex>
            </v-flex>
            <v-flex v-for="button in question.buttons" :key="button.id">{{ button.label }}
              <v-btn fab dark class="indigo">
                <v-icon dark>location_on</v-icon>
              </v-btn>
            </v-flex>
          </v-container>

          </v-card-text>
        </v-card>
      </v-container>
    </v-form>
    </v-flex>
  </v-layout>
  </v-container>
</template>
<script>
export default {
  data() {
    return {
      questionnaire: {
        properties: {
          mapExtent: [],
          loginRequired: false,
          introduction: {
            items: [
              { id: 1, type: 'heading', value: 'Ένας τίτλος' },
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
            value: '',
          },
          { id: 'question2',
            type: 'combobox',
            page: '2',
            title: 'text',
            description: 'label',
            value: '',
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
              { id: 'c2', label: 'testlabels2', value: true },
              { id: 'c3', label: 'testlabels3', value: false },
            ],
          },
          { id: 'question4',
            type: 'radioGroup',
            page: '2',
            title: 'Lorem ipsum',
            description: 'radio1',
            valueTotal: '',
            radios: [
              { id: 'r1', label: 'testlabels1', value: false },
              { id: 'r2', label: 'testlabels2', value: false },
              { id: 'r3', label: 'testlabels3', value: false },
            ],
          },
          { id: 'question5',
            type: 'mapPointer',
            page: '2',
            title: 'Βάλε στο χάρτη τον προορισμό',
            description: 'description',
            buttons: [
              { id: 'g1', label: 'Αφετηρία', value: null },
              { id: 'g2', label: 'Προορισμός', value: null },
            ],
          },
        ],
      },
    };
  },
};
</script>
