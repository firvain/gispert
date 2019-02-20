<template>
  <v-card class="elevation-0">
    <v-card-text>
      <v-container fluid>
        <v-form>

          <v-layout row v-for="section in sections" :key="section.id">

            <v-flex v-if="section.item.type === 'textfield'">{{ section.item.text }}
              <v-text-field
                name="input-1"
                :label='section.item.label'
                v-model="section.item.value"
              ></v-text-field>
            </v-flex>

            <v-flex v-if="section.item.type === 'combobox'">{{ section.item.text }}
              <v-select
                v-bind:items="section.item.items"
                v-model="section.item.value"
                :label="section.item.label"
                single-line
                bottom
              ></v-select>
            </v-flex>

            <v-layout row wrap>
              <v-flex xs12 sm4 md4 v-if="section.item.type === 'checkboxGroup'">{{ section.item.text }}
                <v-flex v-for="checkbox in section.item.checkboxes" :key="checkbox.id">
                  <v-checkbox
                    :label="checkbox.label"
                    v-model="checkbox.value"
                    :value="checkbox.value">
                  </v-checkbox>
                </v-flex>
              </v-flex>
            </v-layout>

            <v-layout row wrap>
              <v-flex v-if="section.item.type === 'radioGroup'">{{ section.item.text }}
                  <v-radio-group column>
                <v-flex v-for="radio in section.item.radios" :key="radio.id">
                    <v-radio :label="radio.label" :value="radio.value" ></v-radio>
                </v-flex>
                  </v-radio-group>
              </v-flex>
            </v-layout>


          </v-layout>

        </v-form>
      </v-container>
    </v-card-text>
</v-card>
</template>
<script>
export default {
  data() {
    return {
      sections: [
        { id: 'section1',
          item: {
            id: 1,
            type: 'textfield',
            page: '1',
            text: 'Γράψε μια διασταύρωση που ειναι επικίνδυνη',
            label: 'label',
            value: '',
          },
        },
        { id: 'section2',
          item: {
            id: 3,
            type: 'combobox',
            page: '2',
            text: 'text',
            label: 'label',
            value: '',
            items: [1, 2, 4, 5, 8],
          },
        },
        { id: 'section3',
          item: {
            id: 4,
            type: 'checkboxGroup',
            page: '2',
            text: 'check1',
            label: 'check1',
            value: '',
            checkboxes: [
              { id: 'c1', label: 'testlabels', value: false },
              { id: 'c2', label: 'testlabels', value: false },
              { id: 'c3', label: 'testlabels', value: false },
            ],
          },
        },
        { id: 'section4',
          item: {
            id: 5,
            type: 'radioGroup',
            page: '2',
            text: 'radio1',
            label: 'radio1',
            value: '',
            column: 1,
            radios: [
              { id: 'r1', label: 'testlabels', value: false },
              { id: 'r2', label: 'testlabels', value: false },
              { id: 'r3', label: 'testlabels', value: false },
            ],
          },
        },
      ],
    };
  },
};
</script>
