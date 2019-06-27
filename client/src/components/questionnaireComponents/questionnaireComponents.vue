<template>
  <!-- <v-container pa-1 ma-1> -->
    <v-card>
      <v-card-title primary-title>
        <div>
          <h3 :class="titleClass(question)">{{ question.title }} <span v-if="question.optional === true">*</span></h3>
          <v-alert color="error" icon="warning" :value="question.error">
            {{ $t('message.questionNotAnswered') }}
          </v-alert>
          <div> {{ question.description }} </div>
        </div>
      </v-card-title>

      <v-card-text>
        <v-flex v-if="question.type === 'textfield'">
          <v-text-field
            name="input-1"
            v-model="question.value"
            :label="$t('message.yourAnswer')"
          ></v-text-field>
        </v-flex>

        <v-flex v-if="question.type === 'textarea'">
          <v-textarea
            name="input-1"
            v-model="question.value"
            :label="$t('message.yourAnswer')"
          ></v-textarea>
        </v-flex>

        <v-flex v-if="question.type === 'textfieldvalidation' && question.validation === 'email'">
          <v-text-field
            name="input-2"
            v-model="question.value"
            :label="$t('message.yourAnswer')"
            :rules="emailRules"
          ></v-text-field>
        </v-flex>

        <v-flex v-if="question.type === 'combobox'">
          <v-select
            v-bind:items="question.items"
            v-model="question.value"
            item-value="value"
            item-text="value"
            
            :label="$t('message.yourAnswer')"
            single-line
            menu-props="bottom"
            v-on:input="pagehandler.toggleSections(); pagehandler.toggleQuestions();"
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

        <v-container row wrap v-if="question.type === 'preferenceHierarchy'">
          <v-list one-line>
            <draggable v-model="question.optionsToSort" @start="drag=true" @end="drag=false">
              <template v-for='element in question.optionsToSort'>
                <v-list-tile :key="element.id" avatar class='force-hover'>
                  <v-list-tile-avatar>
                    <v-icon>drag_indicator</v-icon>
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title v-html="element.label"></v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </template>
            </draggable>
          </v-list>
        </v-container>

        <v-container row wrap v-if="question.type === 'mapPointer'">
          <v-flex v-for="button in question.buttons" :key="button.id">{{ button.label }}
            <v-btn small fab dark :color="button.style.strkClr"
              @click="getFromMap(button.id, 'Point', button.label, button.style);
              $store.commit('setDrawMessage', '<code>Κάντε κλικ στο σημείο της απάντησής σας</code>');">
              <v-icon dark>location_on</v-icon>
            </v-btn>
          </v-flex>
        </v-container>

        <v-container row wrap v-if="question.type === 'mapLineString'">
          <v-flex v-for="button in question.buttons" :key="button.id">{{ button.label }}
            <v-btn small fab dark :color="button.style.strkClr"
              @click="getFromMap(button.id, 'LineString', button.label, button.style);
              $store.commit('setDrawMessage', '<code>Διπλό κλικ για ολοκλήρωση σχεδίασης,<br>Delete για διαγραφή τελευταίου σημείου</code>');">
              <v-icon dark>timeline</v-icon>
            </v-btn>
          </v-flex>
        </v-container>

        <v-container v-if="question.type === 'mapPointerMultiple'">
          <v-layout row wrap v-for="line in question.lines" :key="line.id">
            <v-flex xs10>
              <v-text-field
                name="input-1"
                v-model="line.value"
                :label="$t('message.yourAnswer')"
              ></v-text-field>
            </v-flex>
            <v-flex xs2>
              <v-btn small fab dark class="indigo"
                @click="getFromMap(line.id, 'Point', line.value, line.style);
                $store.commit('setDrawMessage', '<code>Κάντε κλικ στο σημείο της απάντησής σας</code>');">
                <v-icon dark>location_on</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
          <v-btn dark class="indigo" @click="addRow(question)">
            {{ $t('message.addLine')}}
          </v-btn>
        </v-container>
        <v-container v-if="question.type === 'mapLinesMultiple'">
          <v-layout row wrap v-for="line in question.lines" :key="line.id">
            <v-flex xs10>
              <v-text-field
                name="input-1"
                v-model="line.value"
                :label="$t('message.yourAnswer')"
              ></v-text-field>
            </v-flex>
            <v-flex xs2>
              <v-btn small fab dark class="indigo"
                @click="getFromMap(line.id, 'LineString', line.value, line.style);
                $store.commit('setDrawMessage', '<code>Διπλό κλικ για ολοκλήρωση σχεδίασης,<br>Delete για διαγραφή τελευταίου σημείου</code>');">
                <v-icon dark>timeline</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
          <v-btn dark class="indigo" @click="addRow(question)">
            {{ $t('message.addLine')}}
          </v-btn>
        </v-container>

        <v-container fluid v-if="question.type === 'tableOfCheckboxes'">
          <v-layout row wrap>
            <v-container>
              <v-flex xs12 md12>
                  <v-layout row wrap>
                      <v-flex xs1> 
                      </v-flex>
                      <v-flex xs1 ma-2 v-for="answer in question.horizontalValues" :key="answer.id">
                        {{ answer.text }}
                      </v-flex>
                  </v-layout>
              </v-flex>
              <v-flex xs12 md12>
                <v-layout row wrap v-for="item in question.items" :key="item.id">
                  <v-flex xs1 ma-1>{{ item.title }}</v-flex>
                  <v-flex ma-2 v-for="answer in item.answers" :key="answer.id" xs1>
                    <v-checkbox light v-model="answer.selected"></v-checkbox>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-container>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  <!-- </v-container> -->
</template>
<script>
import olMap from '../../js/map';

export default {
  props: ['question'],
  methods: {
    titleClass(question) {
      return !question.style.titleFontSize ? 'headline mb-0' : 'subheading';
    },
    getFromMap(id, type, title, style) {
      olMap.removeFeaturesFromLayer('customLayer', 'buttonId', [id]);
      this.$store.commit('setQuestionnaireFeatureId', id);
      const featureStyle = {
        strkWdth: style.strkWdth,
        strkClr: style.strkClr,
        fllClr: style.fllClr,
        radius: style.radius,
        messages: title,
      };
      this.$store.commit('setDrawnFeatureStyle', featureStyle);
      this.$store.commit('setMapState', 'mapAvailable');
      olMap.setActiveInteraction(type);
    },
  },
};
</script>