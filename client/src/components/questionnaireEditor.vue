<template>
  <v-container>
    <v-layout row wrap xs12 sm12 md12>
      <v-flex>
        <v-card>
          <v-card-title primary-title>
              <h3 class="headline mb-0">Προσθήκη ερώτησης</h3>
              <!-- <v-alert color="error" icon="warning" :value="question.error">
                Δεν έχετε απαντήσει στην ερώτηση
              </v-alert> -->
              <v-flex xs12 sm12 md12>
                <v-select
                  v-bind:items="questionTypes"
                  item-value="type"
                  item-text="name"
                  v-model="newQuestion"
                  label="Τύπος ερώτησης"
                  single-line
                  menu-props='bottom'
                  v-on:input="loadQuestionType"
                ></v-select>
              </v-flex>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap xs12 sm12 md12 v-if="questionnaire">
      <v-flex>
        <div v-if="questionnaire">
          <v-container fluid row
            v-for="item in questionnaire.properties.introduction.items"
            :key="item.id"
          >
            <h3 v-if="item.type === 'heading'" class="headline mb-0">{{ item.value }}</h3>
            <div v-if="item.type === 'text'" > {{ item.value }} </div>
            <img v-if="item.type === 'image'" :src="item.value" aspect-ratio="2.75"/>
          </v-container>
        </div>

        <v-container pa-1 ma-0 row v-for="question in questionnaire.questions" :key="question.id">
          <v-card>
            <v-layout row wrap>
              <v-flex xs12 pa-1>
                <v-card>
                  <v-card-title primary-title>
                    <div>
                      <div><h4>Προεπισκόπηση ερώτησης</h4></div>
                      <h3 class="headline mb-0">{{ question.title }} <span v-if="question.optional === false">*</span></h3>
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
                        disabled
                      ></v-text-field>
                    </v-flex>
                    <v-btn @click="question.editing = !question.editing" v-if="!question.editing">
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex pa-1 v-if="question.editing">
                <v-card>
                  <v-card-title primary-title>
                    <div>
                      <div><h4>Επιλογές ερώτησης</h4></div>
                    </div>
                  </v-card-title>
                  <v-container>
                    <v-flex v-if="question.type === 'textfield'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        label="Ερώτηση"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        label="Περιγραφή"
                      ></v-text-field>
                      <v-checkbox
                        label="Προαιρετικό"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>save</v-icon>
                      </v-btn>
                      <v-btn flat @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>keyboard_arrow_up</v-icon>
                      </v-btn>
                      <v-btn flat @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>keyboard_arrow_down</v-icon>
                      </v-btn>
                    </v-flex>
                  </v-container>
                </v-card>
              </v-flex>
            </v-layout>
          </v-card>
        </v-container>

            <!-- <v-flex v-if="question.type === 'combobox'">
              <v-select
                v-bind:items="question.items"
                v-model="question.value"
                label="Η απάντησή σας"
                single-line
                menu-props="bottom"
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
            </v-container> -->
        
        <v-btn dark block class="indigo" @click="submit('all')">
          ΑΠΟΘΗΚΕΥΣΗ ΕΡΩΤΗΜΑΤΟΛΟΓΙΟΥ<v-icon dark>save</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
export default {
  data() {
    return {
      newQuestion: null,
      nextId: 0,
      questionTypes: [
        { type: 'textfield', name: 'Κείμενο' },
        { type: 'combobox', name: 'Πολλαπλής επιλογής' },
      ],
      questionnaire: {
        questions: [],
        properties: {
          mapExtent: [],
          loginRequired: false,
          pages: 0,
          introduction: {
            items: [
              {
                id: 1,
                type: 'heading',
                value: null,
              },
              {
                id: 2,
                type: 'text',
                value: null,
              },
              {
                id: 4,
                type: 'text',
                value: null,
              },
            ],
          },
        },
      },
    };
  },
  methods: {
    loadQuestionType() {
      console.log(this.newQuestion);
      if (this.newQuestion === 'textfield') {
        const textfield = {
          id: this.nextId,
          type: 'textfield',
          page: 0,
          title: null,
          description: null,
          value: null,
          error: false,
          optional: false,
          editing: true,
        };
        this.questionnaire.questions.push(textfield);
      }
      if (this.newQuestion === 'combobox') {
        const textfield = {
          id: this.nextId,
          type: 'combobox',
          page: 0,
          title: null,
          description: null,
          value: null,
          items: [],
          error: false,
          optional: false,
          editing: true,
        };
        this.questionnaire.questions.push(textfield);
      }
      this.nextId += 1;
    },
  },
};
// TODO move up down and sort questions
// delete question
// insert page breaks
// input title images etc
// rest of question types
// save send to database
// show questionnaires in users account
// question validation rules
// localization
</script>
