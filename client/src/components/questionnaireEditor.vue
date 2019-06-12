<template>
    <v-layout row wrap xs12 sm12 md12 v-if="questionnaire">
      <v-flex>
        <p>Editor @{{ userEditingNow }}</p>
        <p>Viewers
          <v-badge color="blue">
            <template v-slot:badge>
              <span  v-if="usersViewingQuestionnaire">{{ usersViewingQuestionnaire.length }}</span>
            </template>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon color="primary" dark v-on="on">person</v-icon>
              </template>
              <ul id="example-1" v-if="usersViewingQuestionnaireNames">
                <li v-for="item in usersViewingQuestionnaireNames" :key="item">
                  {{ item }}
                </li>
              </ul>
              <!-- <span>{{ usersViewingQuestionnaireNames }}</span> -->
            </v-tooltip>
          </v-badge>
        </p>
      <v-btn block dark outline small color="green"
        @click="closeQuestionnaire(); changeQuestionnaireMode('normal');"
        v-if="$store.state.questionnaireMode !== 'normal'">
        <v-icon dark>undo</v-icon>
        {{ $t('message.back')}}
      </v-btn>
      <h1>{{ $t('message.createQuestionnaire')}}</h1>
        <v-flex v-if="questionnaire.properties.introduction.items.length > 0">
          <v-flex fluid row
            v-for="item in questionnaire.properties.introduction.items"
            :key="item.id"
          >
            <v-text-field
              v-if="item.type === 'heading'"
              name="input-1"
              v-model="item.value"
              :label="$t('message.questionnaireTitle')"
            ></v-text-field>
            <v-text-field
              v-if="item.type === 'text'"
              name="input-1"
              v-model="item.value"
              :label="$t('message.questionnaireDescription')"
            ></v-text-field>
            <img v-if="item.type === 'image'" :src="item.value" aspect-ratio="2.75"/>

            <!-- <v-checkbox
              v-if="item.type === 'loginRequired'"
              label="Να απαιτείται η εγγραφή του χρήστη"
              v-model="questionnaire.properties.loginRequired">
            </v-checkbox> -->
          </v-flex>
        </v-flex>

        <v-switch
          v-model="questionnaire.properties.publicAccess"
          :label="$t('message.enablePublicAccess')"
        ></v-switch>

        {{ $t('message.questionnaireMapExtent')}}
        <v-btn small fab dark class="indigo" @click="getFromMap('qExtent', 'Box')">
          <v-icon dark>location_on</v-icon>
        </v-btn>

        <v-select
          class="top"
          v-bind:items="languages"
          item-text="name"
          item-value="id"
          v-model="questionnaire.properties.locale"
          :label="$t('message.selectLanguage')"
          single-line
          menu-props='bottom'
        ></v-select>

        <v-dialog
          ref="dialogStart"
          v-model="datePickerStart"
          :return-value.sync="dateStart"
          persistent
          lazy
          full-width
          width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              :value="computedDateFormattedMomentjsStart"
              :label="$t('message.questionnaireStart')"
              prepend-icon="event"
              readonly
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="dateStart" scrollable>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="datePickerStart = false">{{ $t('message.cancel') }}</v-btn>
            <v-btn flat color="primary" @click="$refs.dialogStart.save(dateStart)">OK</v-btn>
          </v-date-picker>
        </v-dialog>

        <v-dialog
          ref="dialogEnd"
          v-model="datePickerEnd"
          :return-value.sync="dateEnd"
          persistent
          lazy
          full-width
          width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              :value="computedDateFormattedMomentjsEnd"
              :label="$t('message.questionnaireEnd')"
              prepend-icon="event"
              readonly
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="dateEnd" scrollable>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="datePickerEnd = false">Cancel</v-btn>
            <v-btn flat color="primary" @click="$refs.dialogEnd.save(dateEnd)">OK</v-btn>
          </v-date-picker>
        </v-dialog>


        <v-container pa-1 ma-0 row v-for="question in questionnaire.questions" :key="question.id">
          <v-card>
            <v-layout row wrap>
              <v-flex xs12 pa-1>
                <v-card>
                  <v-card-title primary-title>
                    <div>
                      <div><h4>{{ $t('message.previewQuestionnaire')}}</h4></div>
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
                        :label="$t('message.yourAnswer')"
                        disabled
                      ></v-text-field>
                    </v-flex>
                    <v-flex v-if="question.type === 'textfield' && question.validation">
                      <v-text-field
                        name="input-1"
                        v-model="question.value"
                        :label="$t('message.yourAnswer')"
                        disabled
                      ></v-text-field>
                    </v-flex>
                    <v-flex v-if="question.type === 'combobox'">
                      <v-select
                        v-bind:items="question.items"
                        item-value="id"
                        item-text="value"
                        :label="$t('message.yourAnswer')"
                        single-line
                        menu-props="bottom"
                      ></v-select>
                    </v-flex>
                    <v-container row wrap v-if="question.type === 'checkboxGroup'">
                        <v-flex v-for="checkbox in question.checkboxes" :key="checkbox.id">
                          <v-checkbox
                            :label="checkbox.label">
                          </v-checkbox>
                        </v-flex>
                    </v-container>
                    <v-container row wrap v-if="question.type === 'radioGroup'">
                      <v-radio-group v-model="question.value" mandatory>
                        <v-radio
                          v-for="radio in question.radios"
                          :key="radio.id"
                          :label="`${radio.label}`"
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
                        <v-btn small fab dark :color="button.style.strkClr">
                          <v-icon dark>location_on</v-icon>
                        </v-btn>
                      </v-flex>
                    </v-container>
                    <v-container row wrap v-if="question.type === 'mapLineString'">
                      <v-flex v-for="button in question.buttons" :key="button.id">{{ button.label }}
                        <v-btn small fab dark :color="button.style.strkClr">
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
                          <v-btn small fab dark class="indigo">
                            <v-icon dark>location_on</v-icon>
                          </v-btn>
                        </v-flex>
                      </v-layout>
                      <v-btn dark class="indigo">
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
                          <v-btn small fab dark class="indigo">
                            <v-icon dark>timeline</v-icon>
                          </v-btn>
                        </v-flex>
                      </v-layout>
                      <v-btn dark class="indigo">
                        {{ $t('message.addLine')}}
                      </v-btn>
                    </v-container>
                    <v-flex v-if="question.type === 'titleDescription'">
                      <h3 class="headline mb-0">{{ question.title }}</h3>
                      <div> {{ question.description }} </div>
                    </v-flex>

                    <v-layout row wrap align-center>
                      <v-flex xs4>
                        <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="!question.editing">
                          <v-icon>folder</v-icon>
                        </v-btn>
                        <v-btn flat outline fab small @click="reorderQuestions(question, 'up');">
                          <v-icon>arrow_upward</v-icon>
                        </v-btn>
                        <v-btn flat outline fab small @click="reorderQuestions(question, 'down');">
                          <v-icon>arrow_downward</v-icon>
                        </v-btn>
                      </v-flex>
                      <v-flex xs4>
                        <v-checkbox
                          v-model="question.pageBreak"
                          @change="pageBreakChangeControl"
                          :label="$t('message.changeSection')">
                        </v-checkbox>
                      </v-flex>
                      <v-flex>
                        <h5>{{ $t('message.section')}}: {{ question.page + 1 }}</h5>
                      </v-flex>
                  </v-layout>

                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex pa-1 v-if="question.editing">
                <v-card>
                  <v-card-title primary-title xs12>
                    <div>
                      <div><h4>{{ $t('message.questionOptions')}}</h4></div>
                    </div>
                  </v-card-title>
                  <v-container>


                    <v-flex v-if="question.type === 'textfield'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        :label="$t('message.question')"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        :label="$t('message.description')"
                      ></v-text-field>
                      <v-checkbox
                        :label="$t('message.optional')"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>folder_open</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'textfieldvalidation'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        :label="$t('message.question')"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        :label="$t('message.description')"
                      ></v-text-field>
                      <v-select
                        v-bind:items="['email']"
                        v-model="question.validation"
                        :label="$t('message.selectValidationType')"
                        single-line
                        return-object
                        menu-props="bottom"
                      ></v-select>
                      <v-checkbox
                        :label="$t('message.optional')"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>folder_open</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>



                    <v-flex v-if="question.type === 'combobox'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        :label="$t('message.question')"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        :label="$t('message.description')"
                      ></v-text-field>
                      <v-list>
                        <v-btn flat outline fab small @click="nextItemId += 1; question.items.push({id: nextItemId, value: ''});" v-if="question.editing">
                          <v-icon>add</v-icon>
                        </v-btn>
                        <template v-for="item in question.items">
                          <v-list-tile
                              :key="item.id"
                          >
                            <v-list-tile-content>
                              <v-layout>
                              <v-flex xs12>
                              <v-text-field
                                name="input-1"
                                v-model="item.value"
                                append-icon="delete"
                                :label="item.value"
                                @click:append="question.items.remove(item)"
                              ></v-text-field>
                              <!-- <v-icon>delete</v-icon> -->
                              </v-flex>
                              <v-flex xs12>
                              <v-select
                                :items="getQuestionnairePagesAsArray"
                                v-model="item.activateSections"
                                label="Ενεργοποίηση ενότητας"
                                single-line
                                multiple
                                menu-props="bottom"
                              ></v-select>
                              </v-flex>
                              </v-layout>
                            </v-list-tile-content>
                          </v-list-tile>
                        </template>
                      </v-list>
                      <v-checkbox
                        :label="$t('message.optional')"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>folder_open</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'checkboxGroup'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        :label="$t('message.question')"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        :label="$t('message.description')"
                      ></v-text-field>
                      <v-list>
                        <v-btn flat outline fab small @click="nextItemId += 1; question.checkboxes.push({id: nextItemId, label: '', value: false});"
                          v-if="question.editing">
                          <v-icon>add</v-icon>
                        </v-btn>
                        <template v-for="item in question.checkboxes">
                          <v-list-tile
                              :key="item.id"
                          >
                            <v-list-tile-content>
                              <v-text-field
                                name="input-1"
                                v-model="item.label"
                                append-icon="delete"
                                @click:append="question.checkboxes.remove(item)"
                              ></v-text-field>
                              <v-icon>delete</v-icon>
                            </v-list-tile-content>
                          </v-list-tile>
                        </template>
                      </v-list>
                      <v-checkbox
                        :label="$t('message.optional')"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>folder_open</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'radioGroup'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        :label="$t('message.question')"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        :label="$t('message.description')"
                      ></v-text-field>
                      <v-list>
                        <v-btn flat outline fab small @click="nextItemId += 1; question.radios.push({id: nextItemId, label: '', value: false});"
                          v-if="question.editing">
                          <v-icon>add</v-icon>
                        </v-btn>
                        <template v-for="item in question.radios">
                          <v-list-tile
                              :key="item.id"
                          >
                            <v-list-tile-content>
                              <v-text-field
                                name="input-1"
                                v-model="item.label"
                                append-icon="delete"
                                @click:append="question.radios.remove(item)"
                              ></v-text-field>
                              <v-icon>delete</v-icon>
                            </v-list-tile-content>
                          </v-list-tile>
                        </template>
                      </v-list>
                      <v-checkbox
                        :label="$t('message.optional')"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>folder_open</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'preferenceHierarchy'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        :label="$t('message.question')"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        :label="$t('message.description')"
                      ></v-text-field>
                      <v-list>
                        <v-btn flat outline fab small @click="nextItemId += 1; question.optionsToSort.push({id: nextItemId, label: '', value: false});"
                          v-if="question.editing">
                          <v-icon>add</v-icon>
                        </v-btn>
                        <template v-for="item in question.optionsToSort">
                          <v-list-tile
                              :key="item.id"
                          >
                            <v-list-tile-content>
                              <v-text-field
                                name="input-1"
                                v-model="item.label"
                                append-icon="delete"
                                @click:append="question.optionsToSort.remove(item)"
                              ></v-text-field>
                              <v-icon>delete</v-icon>
                            </v-list-tile-content>
                          </v-list-tile>
                        </template>
                      </v-list>
                      <v-checkbox
                        :label="$t('message.optional')"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>folder_open</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'mapPointer'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        :label="$t('message.question')"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        :label="$t('message.description')"
                      ></v-text-field>
                      <v-list>
                        <v-btn flat outline fab small @click="nextItemId += 1; question.buttons.push({id: nextItemId, label: '', coords: null});"
                          v-if="question.editing">
                          <v-icon>add</v-icon>
                        </v-btn>

                        <template v-for="item in question.buttons">
                          <v-list-tile
                              :key="item.id"
                          >
                            <v-list-tile-content>
                              <v-text-field
                                name="input-1"
                                v-model="item.label"
                                append-icon="delete"
                                @click:append="question.buttons.remove(item)"
                              ></v-text-field>
                              <v-icon>delete</v-icon>
                            </v-list-tile-content>
                            <Swatches v-model="item.style.strkClr" popover-to="left" swatch-size='24' inline/>
                            <v-flex xs12 sm3 md1>
                              <v-text-field
                                v-model="item.style.radius"
                                label="size"
                                box
                              ></v-text-field>
                            </v-flex>
                          </v-list-tile>
                        </template>
                      </v-list>
                      <v-checkbox
                        :label="$t('message.optional')"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>folder_open</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'mapLineString'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        :label="$t('message.question')"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        :label="$t('message.description')"
                      ></v-text-field>
                      <v-list>
                        <v-btn flat outline fab small @click="nextItemId += 1; question.buttons.push({id: nextItemId, label: '', coords: null});"
                          v-if="question.editing">
                          <v-icon>add</v-icon>
                        </v-btn>
                        <template v-for="item in question.buttons">
                          <v-list-tile
                              :key="item.id"
                          >
                            <v-list-tile-content>
                              <v-text-field
                                name="input-1"
                                v-model="item.label"
                                append-icon="delete"
                                @click:append="question.buttons.remove(item)"
                              ></v-text-field>
                              <v-icon>delete</v-icon>
                            </v-list-tile-content>
                            <Swatches v-model="item.style.strkClr" popover-to="left" swatch-size='24' inline/>
                            <v-flex xs12 sm3 md1>
                              <v-text-field
                                v-model="item.style.strkWdth"
                                label="size"
                                box
                              ></v-text-field>
                            </v-flex>
                          </v-list-tile>
                        </template>
                      </v-list>
                      <v-checkbox
                        :label="$t('message.optional')"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>folder_open</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'mapPointerMultiple'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        :label="$t('message.question')"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        :label="$t('message.description')"
                      ></v-text-field>
                      <v-checkbox
                        :label="$t('message.optional')"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>folder_open</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'mapLinesMultiple'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        :label="$t('message.question')"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        :label="$t('message.description')"
                      ></v-text-field>
                      <v-checkbox
                        :label="$t('message.optional')"
                        v-model="question.optional">
                      </v-checkbox>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>folder_open</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>


                    <v-flex v-if="question.type === 'titleDescription'">
                      <v-text-field
                        name="input-1"
                        v-model="question.title"
                        label="Τίτλος"
                      ></v-text-field>
                      <v-text-field
                        name="input-1"
                        v-model="question.description"
                        :label="$t('message.description')"
                      ></v-text-field>
                      <v-btn flat outline fab small @click="question.editing = !question.editing" v-if="question.editing">
                        <v-icon>folder_open</v-icon>
                      </v-btn>
                      <v-btn flat outline fab small @click="removeQuestion(question)" v-if="question.editing">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>

                  </v-container>
                </v-card>
              </v-flex>
            </v-layout>
          </v-card>
        </v-container>

        <v-layout row wrap xs12 sm12 md12>
          <v-flex>
            <v-card>
              <v-card-title primary-title>
                  <h3 class="headline mb-0">{{ $t('message.addQuestion') }}</h3>
                  <v-flex xs12 sm12 md12>
                    <v-select
                      v-bind:items="questionTypes"
                      item-value="type"
                      item-text="name"
                      v-model="newQuestion"
                      :label="$t('message.questionType')"
                      single-line
                      menu-props='bottom'
                      v-on:input="loadQuestionType"
                    ></v-select>
                  </v-flex>
              </v-card-title>
            </v-card>
          </v-flex>
        </v-layout>
        <div v-if="userIsEditor || $store.state.questionnaireMode === 'creator'">
          <v-btn @click="saveQuestionnaire().then(() => { this.loading = false });">
            {{ $t('message.saveQuestionnaire') }}<v-icon dark>save</v-icon>
          </v-btn>
          <v-btn @click="closeQuestionnaire()">
            {{ $t('message.cancel') }}<v-icon dark>cancel</v-icon>
          </v-btn>
          <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
        </div>
      </v-flex>
    </v-layout>
</template>
<script>
// import ol from 'openlayers';
import axios from 'axios';
import moment from 'moment';
import draggable from 'vuedraggable';
import Swatches from 'vue-swatches';
import 'vue-swatches/dist/vue-swatches.min.css';
import olMap from '../js/map';
import config from '../config';

export default {
  props: ['qnnaire'],
  components: {
    draggable, Swatches,
  },
  data() {
    return {
      usersViewingQuestionnaire: null,
      userEditingNow: null,
      userIsEditor: false,
      dateStart: null,
      dateEnd: null,
      languages: [
        { id: 'en', name: 'English' },
        { id: 'fr', name: 'Français' },
        { id: 'el_GR', name: 'Ελληνικά' },
        { id: 'de', name: 'Deutsche' },
        { id: 'it', name: 'Italiano' },
        { id: 'es', name: 'Español' },
        { id: 'nn', name: 'Norsk' },
      ],
      datePickerStart: null,
      datePickerEnd: null,
      loading: false,
      newQuestion: null,
      nextId: 0,
      nextItemId: 0,
      questionTypes: [
        { type: 'textfield', name: this.$t('message.text') },
        { type: 'textfieldvalidation', name: 'Text field with validation' },
        { type: 'combobox', name: this.$t('message.expandableMenu') },
        { type: 'checkboxGroup', name: this.$t('message.checkboxes') },
        { type: 'radioGroup', name: this.$t('message.multipleChoice') },
        { type: 'preferenceHierarchy', name: this.$t('message.sortingOptions') },
        { type: 'mapPointer', name: this.$t('message.mapPointer') },
        { type: 'mapLineString', name: this.$t('message.mapLineStringPointer') },
        { type: 'mapPointerMultiple', name: this.$t('message.mapPointerMultiple') },
        { type: 'mapLinesMultiple', name: this.$t('message.mapLinesMultiple') },
        { type: 'titleDescription', name: this.$t('message.titleAndDescription') },
      ],
      questionnaire: {
        questions: [],
        properties: {
          owner: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
          mapExtent: [],
          publicAccess: false,
          dateStart: null,
          dateEnd: null,
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
                id: 3,
                type: 'loginRequired',
                value: false,
              },
            ],
          },
        },
      },
    };
  },
  watch: {
    '$store.state.questionnaireFeatures': function set() {
      const feature = this.$store.state.questionnaireFeatures[0];
      this.questionnaire.properties.mapExtent = feature.getGeometry().getExtent();
    },
  },
  computed: {
    getQuestionnairePagesAsArray() {
      const pagesArray = ['-'];
      for (let index = 1; index <= this.questionnaire.properties.pages + 1; index += 1) {
        pagesArray.push(index);
      }
      return pagesArray;
    },
    computedDateFormattedMomentjsStart() {
      moment.locale(this.$store.state.user.locale);
      this.questionnaire.properties.dateStart = moment(this.dateStart).format('x');
      return this.dateStart ? moment(this.dateStart).format('dddd, MMMM Do YYYY') : '';
    },
    computedDateFormattedMomentjsEnd() {
      moment.locale(this.$store.state.user.locale);
      this.questionnaire.properties.dateEnd = moment(this.dateEnd).format('x');
      return this.dateEnd ? moment(this.dateEnd).format('dddd, MMMM Do YYYY') : '';
    },
    usersViewingQuestionnaireNames() {
      const names = [];
      if (this.usersViewingQuestionnaire) {
        this.usersViewingQuestionnaire.forEach((u) => {
          names.push(u.username);
        });
      }
      return names;
    },
  },
  methods: {
    changeQuestionnaireMode(mode) {
      this.$store.commit('setQuestionnaireMode', mode);
    },
    convertToTimestamp(date) {
      console.log('date to convert :: ', date);
    },
    pageBreakChangeControl() {
      let page = 0;
      this.questionnaire.questions.forEach((q) => {
        // console.log(q.pageBreak);
        if (q.pageBreak) {
          page += 1;
          // eslint-disable-next-line
          q.page = page;
        } else {
          // eslint-disable-next-line
          q.page = page;
        }
      });
      this.questionnaire.properties.pages = page;
    },
    async saveQuestionnaire() {
      // this.$store.commit('setQuestionnaireMode', 'normal');
      this.questionnaire.questions.forEach((q) => {
        // eslint-disable-next-line
        q.editing = false;
      });
      try {
        const url = `${config.url}/questionnaires/save`;
        console.log(url);
        const data = this.questionnaire;
        axios.post(url, { data }, {
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          // this.$store.commit('setQuestionnaireMode', 'normal');
          this.$eventHub.$emit('refreshQuestionnaires');
          console.log('response to save :: ', response);
          if (response.data.type === 'new') {
            console.log('questionnaire new');
          } else if (response.data.type === 'replaced') {
            console.log('questionnaire replaced');
          }
        });
      } catch (error) {
        this.error = error.response.data.error;
      }
      console.log('questionnaire json is :: ', JSON.stringify(this.questionnaire));
    },
    removeQuestion(question) {
      this.questionnaire.questions.remove(question);
    },
    reorderQuestions(question, direction) {
      const index = this.questionnaire.questions.findIndex(item => item.id === question.id);
      if (direction === 'up') {
        this.questionnaire.questions.move(index, index - 1);
      } else if (direction === 'down') {
        this.questionnaire.questions.move(index, index + 1);
      }
      this.pageBreakChangeControl();
    },
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
          pageBreak: false,
        };
        this.questionnaire.questions.push(textfield);
      }
      if (this.newQuestion === 'textfieldvalidation') {
        const textfieldvalidation = {
          id: this.nextId,
          type: 'textfieldvalidation',
          page: 0,
          title: null,
          description: null,
          value: null,
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
          validation: null,
        };
        this.questionnaire.questions.push(textfieldvalidation);
      }
      if (this.newQuestion === 'combobox') {
        const combobox = {
          id: this.nextId,
          type: 'combobox',
          page: 0,
          title: null,
          description: null,
          value: null,
          items: [{ id: `i${this.nextItemId}`, value: '', activateSections: [] }],
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(combobox);
      }
      if (this.newQuestion === 'checkboxGroup') {
        const checkboxGroup = {
          id: this.nextId,
          type: 'checkboxGroup',
          page: 0,
          title: null,
          description: null,
          value: null,
          checkboxes: [{ id: `i${this.nextItemId}`, label: '', value: false }],
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(checkboxGroup);
      }
      if (this.newQuestion === 'radioGroup') {
        const radioGroup = {
          id: this.nextId,
          type: 'radioGroup',
          page: 0,
          title: null,
          description: null,
          value: null,
          radios: [{ id: `i${this.nextItemId}`, label: '', radioValue: false }],
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(radioGroup);
      }
      if (this.newQuestion === 'mapPointer') {
        const mapPointer = {
          id: this.nextId,
          type: 'mapPointer',
          page: 0,
          title: null,
          description: null,
          value: null,
          buttons: [
            {
              id: `i${this.nextItemId}`,
              label: '',
              coords: null,
              style: {
                radius: 5,
                strkWdth: 1,
                strkClr: 'blue',
                fllClr: 'orange',
              },
            },
          ],
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(mapPointer);
      }
      if (this.newQuestion === 'mapLineString') {
        const mapLineString = {
          id: this.nextId,
          type: 'mapLineString',
          page: 0,
          title: null,
          description: null,
          value: null,
          buttons: [
            { id: `i${this.nextItemId}`,
              label: '',
              coords: null,
              style: {
                strkWdth: 1,
                strkClr: 'blue',
                fllClr: 'orange',
              },
            },
          ],
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(mapLineString);
      }
      if (this.newQuestion === 'preferenceHierarchy') {
        const preferenceHierarchy = {
          id: this.nextId,
          type: 'preferenceHierarchy',
          page: 0,
          title: null,
          description: null,
          value: null,
          optionsToSort: [],
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(preferenceHierarchy);
      }
      if (this.newQuestion === 'mapPointerMultiple') {
        const mapPointerMultiple = {
          id: this.nextId,
          type: 'mapPointerMultiple',
          page: 0,
          title: null,
          description: null,
          value: null,
          lines: [{
            id: `i${this.nextItemId}`,
            value: '',
            coords: null,
            style: {
              strkWdth: 1,
              strkClr: 'blue',
              fllClr: 'orange',
            },
          }],
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(mapPointerMultiple);
      }
      if (this.newQuestion === 'mapLinesMultiple') {
        const mapLinesMultiple = {
          id: this.nextId,
          type: 'mapLinesMultiple',
          page: 0,
          title: null,
          description: null,
          value: null,
          lines: [{
            id: `i${this.nextItemId}`,
            value: '',
            coords: null,
            style: {
              strkWdth: 1,
              strkClr: 'blue',
              fllClr: 'orange',
            },
          }],
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(mapLinesMultiple);
      }
      if (this.newQuestion === 'titleDescription') {
        const titleDescription = {
          id: this.nextId,
          type: 'titleDescription',
          page: 0,
          title: null,
          description: null,
          error: false,
          optional: false,
          editing: true,
          pageBreak: false,
        };
        this.nextItemId += 1;
        this.questionnaire.questions.push(titleDescription);
      }
      this.nextId += 1;
      this.$nextTick(() => {
        this.newQuestion = null;
        this.pageBreakChangeControl();
      });
    },
    getFromMap(id, type) {
      olMap.removeFeaturesFromLayer('customLayer', 'buttonId', id);
      this.$store.commit('setQuestionnaireFeatureId', id);
      olMap.setActiveInteraction(type);
    },
    findNextItemId() {
      let count = 0;
      this.questionnaire.questions.forEach((e) => {
        if (e.items) { count += e.items.length; }
        if (e.lines) { count += e.lines.length; }
        if (e.buttons) { count += e.buttons.length; }
        if (e.checkboxes) { count += e.checkboxes.length; }
        if (e.radios) { count += e.radios.length; }
      });
      this.nextItemId = count + 1;
    },
    closeQuestionnaire() {
      this.$store.commit('setQuestionnaireMode', 'normal');
      this.$eventHub.$emit('refreshQuestionnaires');
      this.$socket.emit('exitQuestionnaireRoom', {
        user: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        questionnaire: this.questionnaire._id, // eslint-disable-line no-underscore-dangle
      });
    },
  },
  mounted() {
    this.$options.sockets.userEditingThisQuestionnaire = (data) => {
      console.log('this user is editing :: ', data);
      this.userEditingNow = data.username;
      if (this.$store.state.user._id === data.user) { // eslint-disable-line no-underscore-dangle
        this.userIsEditor = true;
      } else {
        this.userIsEditor = false;
      }
    };
    this.$options.sockets.liveUsersInThisQuestionnaire = (data) => {
      console.log('these users are in :: ', data);
      this.usersViewingQuestionnaire = data;
    };
    this.$socket.emit('joinQuestionnaireRoom', {
      user: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
      questionnaire: this.qnnaire._id, // eslint-disable-line no-underscore-dangle
      username: this.$store.state.user.name,
      timestamp: Date.now(),
    });
    this.$store.commit('setQuestionnaireMode', 'editor');
    console.log('trying to edit :: ', this.qnnaire);
    if (this.qnnaire) {
      console.log('loading questionnaire for edit');
      console.log(this.questionnaire, this.qnnaire.properties.dateStart);
      this.questionnaire = this.qnnaire;
      this.dateStart = moment.unix(this.qnnaire.properties.dateStart / 1000).format('YYYY-MM-DD');
      this.dateEnd = moment.unix(this.qnnaire.properties.dateEnd / 1000).format('YYYY-MM-DD');
      this.nextId = this.questionnaire.questions.length + 1;
      this.findNextItemId();
    }
  },
};
</script>
<style scoped>
  .force-hover:hover {
    background-color: bisque;
    cursor: pointer;
  }
</style>
