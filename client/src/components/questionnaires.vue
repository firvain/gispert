<template>
<v-container id="questionnaires" v-if="$store.state.isUserLoggedIn">
  <v-layout row wrap>
    <v-flex v-if="$store.state.questionnaireMode === 'normal'" xs12>
      <h2>{{ $t('message.questionnairesIcreated') }}</h2>
      <v-btn block @click="createNewQuestionnaire()">{{ $t('message.createQuestionnaire') }}</v-btn>
      <v-list three-line>
        <template v-for="item in $store.state.myQuestionnaires">
          <v-list-tile
              :key="item._id"
          >
            <v-list-tile-content>
              <v-list-tile-title>
                <v-flex>
                  {{ item.properties.introduction.items[0].value }}
                </v-flex>
              </v-list-tile-title>
              <v-list-tile-sub-title>{{ item.properties.introduction.items[1].value }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon ripple @click='openEditorForQuestionnaire(item)'>
                <v-icon color="grey lighten-1">edit</v-icon>
              </v-btn>
            </v-list-tile-action>
            <!-- <v-list-tile-action>
              <v-btn icon ripple @click='openViewerForQuestionnaire(item)'>
                <v-icon color="grey lighten-1">view_module</v-icon>
              </v-btn>
            </v-list-tile-action> -->
            <v-list-tile-action>
              <v-btn icon ripple @click='openViewerForQuestionnaireResults(item)'>
                <v-icon color="grey lighten-1">bar_chart</v-icon>
              </v-btn>
            </v-list-tile-action>
            <v-list-tile-action>
              <v-btn icon ripple @click='shareLink(item._id); sendLinkViaEmailDialog = true;'>
                <v-icon color="grey lighten-1">link</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </template>
      </v-list>
    </v-flex>

    <v-flex v-if="$store.state.questionnaireMode === 'normal'" xs12>
      <h2>{{ $t('message.questionnairesIanswered') }}</h2>
      <v-list three-line>
        <template v-for="item in $store.state.questionnairesIHaveAnswered">
          <v-list-tile
              :key="item._id"
              @click='openViewerForQuestionnaireResult(item)'
          >
            <v-list-tile-content>
              <v-list-tile-title>
                <v-flex>
                  {{ item.properties.introduction.items[0].value }}
                </v-flex>
              </v-list-tile-title>
              <v-list-tile-sub-title>{{ item.properties.introduction.items[1].value }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
    </v-flex>
    <v-flex xs12 sm12 md12>
      <questionnaireEditor :qnnaire="questionnaireForEdit"
        v-if="$store.state.questionnaireMode === 'editor'">
      </questionnaireEditor>
    </v-flex>
    <v-flex xs12 sm12 md12>
      <questionnaireView v-if="$store.state.questionnaireMode === 'viewer'"
        :id="questionnaireForView">
      </questionnaireView>
    </v-flex>
    <v-flex xs12 sm12 md12>
      <questionnaireResultsViewer v-if="$store.state.questionnaireMode === 'resultsViewer'"
        :id="questionnaireForView">
      </questionnaireResultsViewer>
    </v-flex>
    <v-flex xs12 sm12 md12>
      <questionnaireOneResultViewer v-if="$store.state.questionnaireMode === 'oneResultViewer'"
        :id="questionnaireForResult">
      </questionnaireOneResultViewer>
    </v-flex>
  </v-layout>
  <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>


            <v-dialog v-model="sendLinkViaEmailDialog" persistent max-width="800px">
            <v-card>
              <v-card-title>
                {{ $t('message.shareQuestionnaireMessage') }}
              </v-card-title>
              <v-card-text>
                <v-container>
                  {{ questionnaireShareLink }}
                </v-container>
              </v-card-text>
              <v-btn color="blue darken-1" flat @click.native="sendLinkViaEmailDialog = false">{{ $t("message.close") }}</v-btn>
            </v-card>
          </v-dialog>

</v-container>
</template>
<script>
import axios from 'axios';
import questionnaireEditor from '@/components/questionnaireEditor';
import questionnaireView from '@/components/questionnaireView';
import questionnaireResultsViewer from '@/components/questionnaireResultsViewer';
import questionnaireOneResultViewer from '@/components/questionnaireOneResultViewer';
import config from '../config';

export default {
  data() {
    return {
      // myQuestionnaires: [],
      // questionnairesIHaveAnswered: [],
      loading: false,
      questionnaireForView: null,
      questionnaireForEdit: null,
      questionnaireForResult: null,
      questionnaireShareLink: null,
      sendLinkViaEmailDialog: false,
    };
  },
  components: {
    questionnaireEditor,
    questionnaireView,
    questionnaireResultsViewer,
    questionnaireOneResultViewer,
  },
  mounted() {
    this.$eventHub.$on('logged-in', () => {
      this.changeQuestionnaireMode('normal');
      this.loadMyQuestionnaires().then(() => {
        this.loading = false;
      });
      this.loadQuestionnairesIHaveAnswered().then(() => {
        this.loading = false;
      });
    });
    this.$eventHub.$on('refreshQuestionnaires', () => {
      console.log('questionnaires refreshed');
      this.loadMyQuestionnaires().then(() => {
        this.loading = false;
      });
      this.loadQuestionnairesIHaveAnswered().then(() => {
        this.loading = false;
      });
    });
  },
  methods: {
    shareLink(id) {
      this.questionnaireShareLink = `${config.share}/questionnaire/${id}`;
    },
    createNewQuestionnaire() {
      this.changeQuestionnaireMode('editor');
      this.questionnaireForEdit = null;
    },
    openEditorForQuestionnaire(questionnaire) {
      this.changeQuestionnaireMode('editor');
      this.questionnaireForEdit = questionnaire; // eslint-disable-line no-underscore-dangle
      console.log('opening questionnaire for edit :: ', questionnaire);
    },
    openViewerForQuestionnaireResults(questionnaire) {
      console.log(questionnaire);
      this.changeQuestionnaireMode('resultsViewer');
      this.questionnaireForView = questionnaire._id; // eslint-disable-line no-underscore-dangle
    },
    openViewerForQuestionnaireResult(questionnaire) {
      console.log(questionnaire);
      this.changeQuestionnaireMode('oneResultViewer');
      this.questionnaireForResult = questionnaire._id; // eslint-disable-line no-underscore-dangle
    },
    openViewerForQuestionnaire(questionnaire) {
      console.log(questionnaire);
      this.changeQuestionnaireMode('viewer');
      this.questionnaireForView = questionnaire._id; // eslint-disable-line no-underscore-dangle
    },
    changeQuestionnaireMode(mode) {
      this.$store.commit('setQuestionnaireMode', mode);
    },
    async loadMyQuestionnaires() {
      try {
        const url = `${config.url}/questionnaires/owner`;
        console.log(url);
        axios.get(url, {
          params: {
            userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
          },
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          // this.myQuestionnaires.push(response.data);
          this.$store.commit('setMyQuestionnaires', response.data);
        });
      } catch (error) {
        this.error = error.response.data.error;
      }
    },
    async loadQuestionnairesIHaveAnswered() {
      try {
        const url = `${config.url}/questionnaires/answered`;
        console.log(url);
        axios.get(url, {
          params: {
            userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
          },
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          // this.questionnairesIHaveAnswered.push(response.data);
          this.$store.commit('setQuestionnairesIHaveAnswered', response.data);
        });
      } catch (error) {
        this.error = error.response.data.error;
      }
    },
  },
};
</script>
<style>
#questionnaires {
  color: black;
  max-height: 82vh;
  overflow-y: scroll;
}
</style>
