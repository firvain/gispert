<template>
  <v-container fluid align-center>
    <v-layout row wrap>
      <v-flex
        v-if="$route.name === 'questionnaire'"
        :class="layoutOption.leftPanel"
      >
        <qnaire :id="$route.params.id" class="qnaire"></qnaire>
      </v-flex>
      <v-flex
        v-else-if="$route.name === 'questionnaireResults'"
        :class="layoutOption.leftPanel"
      >
        <questionnaireViewer
          :id="$route.params.id"
          fill-height
          class="qnaire"
        ></questionnaireViewer>
      </v-flex>
      <v-flex
        v-else-if="$route.name === 'questionnaireEditor'"
        :class="layoutOption.leftPanel"
      >
        <questionnaireEditor
          :id="$route.params.id"
          fill-height
          class="qnaire"
        ></questionnaireEditor>
      </v-flex>
      <v-flex v-else :class="layoutOption.leftPanel">
        <tabs></tabs>
      </v-flex>
      <v-flex :class="layoutOption.map">
        <mapDiv></mapDiv>
      </v-flex>
    </v-layout>

    <v-dialog v-model="termsOfUseDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <h5>Όροι χρήσης</h5>
        </v-card-title>
        <v-card-text>
          Με την εγγραφή ο χρήστης αποδέχεται πλήρως και ανεπιφύλακτα τους
          παρακάτω Όρους Χρήσης της Πλατφόρμας:
          <li>
            Οι καταχωρήσεις των σχολίων και ιδεών αποτελούν προσωπικές ιδέες ή
            εμπειρίες των συγγραφέων τους (χρηστών), και όχι απόψεις των
            Διαχειριστών της πλατφόρμας
          </li>
          <li>
            Τα προσωπικά δεδομένα των χρηστών δεν χρησιμοποιούνται για
            οποιοδήποτε εμπορικό σκοπό ή για επικοινωνία με αυτούς εκτός κι αν
            παραβιάζονται οι Όροι Χρήσης.
          </li>
          <li>
            Ο Χρήστης παραμένει μοναδικός υπεύθυνος για το περιεχόμενο των
            καταχωρήσεών του. Επιπλέον, είναι υπόλογος για οποιαδήποτε
            οικονομική ή νομική υποχρέωση προκύψει εξαιτίας της κακής χρήσης της
            παρούσας υπηρεσίας.
          </li>
          <li>
            Οι Διαχειριστές της πλατφόρμας διατηρούν το δικαίωμα να
            χρησιμοποιήσουν τα πραγματικά στοιχεία του Χρήστη, σε περίπτωση
            νομικής δράσης που προκύπτει από χρήση που παραβιάζει τους όρους
            χρήσης της πλατφόρμας.
          </li>
          <li>
            Οι καταχωρήσεις επισυναπτόμενου υλικού όπως φωτογραφίες σχετικές με
            την ιδέα που καταθέτει ο χρήστης με την καταχώρησή τους στην
            πλατφόρμα αποκτούν δικαιώματα δημόσιας χρήσης και διανομής
            (creativecommons). Με την καταχώρηση υλικού οι φωτογραφίες αποκτούν
            αυτόματα την άδεια CCBY Αναφορά Δημιουργού (Αυτή η άδεια επιτρέπει
            στους άλλους να διανέμουν, να αναμειγνύουν, και να δημιουργούν πάνω
            στο δικό σας έργο, ακόμηκαι εμπορικά, αρκεί να σας πιστώνουν για την
            αρχική δημιουργία. Άδεια
            εκχώρησης:https://creativecommons.org/licenses/by/4.0/).
          </li>
          <li>
            Τα υποβληθέντα σχόλια και ιδέες ελέγχονται εν μέρει από τον κεντρικό
            διαχειριστή της πλατφόρμας. Τα υποβληθέντα σχόλια και ιδέες θα
            διαγράφονται όταν περιέχουν υβριστικό περιεχόμενο. Επιπλέον το
            επισυναπτόμενο υλικό θα διαγράφεται αν έχει κατά οιονδήποτε τρόπο
            την πρόθεση να βλάψει το πρόσωπο, την ιδιωτικότητα, το φύλο, την
            εθνικότητα, την ιδιωτικότητα κ.ο.κ. οποιουδήποτε υποκειμένου σύμφωνα
            με την εθνική, ευρωπαική και διεθνή νομοθεσία.
          </li>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click.stop="termsOfUseDialog = false">{{
            $t("message.close")
          }}</v-btn>
          <v-spacer></v-spacer>
          <div>
            <i
              >Terra Cognita Ltd, All rights reserved. ©
              {{ new Date().getFullYear() }}</i
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import MobileDetect from "mobile-detect";
import qnaire from "@/components/questionnaireView";
import questionnaireViewer from "@/components/questionnaireResultsViewer";
import questionnaireEditor from "@/components/questionnaireEditor";
// import axios from 'axios';
// import timeline from './timeline';
import tabs from "./tabs";
import mapDiv from "./map";
// import post from './post';
// import config from '../config';

export default {
  name: "Mainpage",
  components: {
    tabs,
    mapDiv,
    qnaire,
    questionnaireViewer,
    questionnaireEditor
  },
  data() {
    return {
      postContent: null,
      postOpen: false,
      drawer: null,
      items: [
        { title: "Home", icon: "dashboard" },
        { title: "About", icon: "question_answer" }
      ],
      right: null,
      olMap: false,
      language: "el_GR",
      termsOfUseDialog: false,
      mobileCheck: false,
      isMobile: false,
      activateMap: true
    };
  },
  computed: {
    layoutOption() {
      const option = {
        leftPanel: "xs6",
        map: "xs6"
      };
      if (this.mobileCheck) {
        // eslint-disable-next-line
        if (this.mobileCheck.phone() || this.mobileCheck.tablet()) {
          this.isMobile = true;
        } else {
          this.isMobile = false;
        }
      }
      if (
        this.$vuetify.breakpoint.smAndDown ||
        this.isMobile ||
        !this.activateMap
      ) {
        if (this.$store.state.mapState === "mapAvailable") {
          option.leftPanel = "d-none";
          option.map = "xs12";
        } else {
          option.leftPanel = "xs12";
          option.map = "d-none";
        }
      } else {
        option.leftPanel = "xs6";
        option.map = "xs6";
      }
      // option.leftPanel = 'xs12';
      // option.map = 'd-none';
      this.$eventHub.$emit("redrawMap");
      return option;
    }
  },
  watch: {
    "$route.params": function handle() {
      // console.log('main router changed and emitting!!!!!!', this.$route.params.id);
      if (this.$route.name === "post") {
        // console.log('loading post from permalink');
        this.loadPostFromPermalink(this.$route.params.id);
      }
      if (this.$route.name === "collection") {
        console.log("loading collection from permalink");
        this.loadCollectionFromPermalink(this.$route.params.id);
      }
      if (this.$route.name === "questionnaire") {
        console.log("loading questionnaire");
        this.loadQuestionnaireView(this.$route.params.id);
      }
      // this.$eventHub.$emit('routerChanged', 'routerChanged');
    }
  },
  mounted() {
    this.olMap = true;
    this.$socket.emit("refreshPosts", "refreshPosts");
    if (this.$route.name === "post") {
      // console.log('loading post from permalink');
      this.loadPostFromPermalink(this.$route.params.id);
    }
    if (this.$route.name === "collection") {
      console.log("loading collection from permalink");
      this.loadCollectionFromPermalink(this.$route.params.id);
    }
    if (this.$route.name === "questionnaire") {
      console.log("loading questionnaire");
      this.loadQuestionnaireView(this.$route.params.id);
    }
    this.mobileCheck = new MobileDetect(window.navigator.userAgent);
    // console.log('mobile checking :: ', this.mobileCheck.mobile());
    this.$eventHub.$on("deactivateMap", () => {
      this.activateMap = false;
    });
  },
  methods: {
    loadPostFromPermalink(id) {
      this.$store.commit("setActiveTab", "explore");
      this.$eventHub.$emit("openPost", id);
    },
    loadCollectionFromPermalink(id) {
      console.log("loading collection from permalink::", id);
      this.$store.commit("setActiveTab", "explore");
      const tl = {
        id,
        type: "collection",
        isEditor: false,
        visibility: "public"
      };
      this.$store.dispatch("setOpenedCustomTimeline", tl);
      this.$eventHub.$emit("openCollection", id);
    },
    loadQuestionnaireView(id) {
      console.log("q::", id);
    }
  }
};
</script>

<style scoped>
html {
  overflow-y: hidden;
}
.nopadding {
  padding: 0px !important;
}
a:hover {
  cursor: pointer;
}
.qnaire {
  overflow-y: scroll;
}
.xs12 {
  max-width: 100%;
}
.xs6 {
  max-width: 50%;
}
.d-none {
  z-index: 0;
}
</style>
