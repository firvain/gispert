<template>
  <v-layout column>
    <v-toolbar class="orange no-padding" dark>
      <i class="fa fa-map fa-4x"></i><v-toolbar-title><h3>Terra Cognita</h3></v-toolbar-title><h6>Collaborative Maps</h6>
      <v-spacer></v-spacer>
        <v-toolbar-items>
            <v-btn flat @click='showRegisterDialogue' v-if="$store.state.isUserLoggedIn === false">
              {{signup}}
            </v-btn>
            <v-btn flat @click='showLoginDialogue' v-if="$store.state.isUserLoggedIn === false">
              {{login_txt}}
            </v-btn>
            <v-btn flat @click='showProfileDialogue' v-if="$store.state.isUserLoggedIn === true">
              {{profile_txt}}
            </v-btn>
            <v-btn flat @click='logoutUser' v-if="$store.state.isUserLoggedIn === true">
              {{logout_txt}}
            </v-btn>
        </v-toolbar-items>

    <v-dialog v-model="dialogRegister" max-width="290">
      <v-card>
        <v-card-title class="headline">Εγγραφή νέου χρήστη</v-card-title>
        <v-card-text>
          <form
          name="register-form"
          autocomplete="off">
          <v-text-field
            label="Όνομα"
            v-model="name"
            :rules="nameRules"
            single-line
          ></v-text-field>
          <br>
          <v-text-field
            label="Κωδικός"
            type="password"
            v-model="password"
            :rules="passRules"
            autocomplete="new-password"
          ></v-text-field>
          <br>
          <v-text-field
            label="Email"
            v-model="email"
            single-line
          ></v-text-field>
          <br>
          <v-text-field
            label="Γράψε αν θέλεις εδώ μια μικρή περιγραφή για σένα"
            v-model="description"
            single-line
          ></v-text-field>
        </form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
        <v-btn v-if="name.length > 0 && password.length > 0"
          dark
          class="cyan"
          @click="register">
          {{signup}}
        </v-btn>
          <v-btn color="green darken-1" flat="flat" @click.native="dialogRegister = false">Άκυρο</v-btn>
        </v-card-actions>
      </v-card>
              <v-snackbar
        :timeout=5000
        v-model="snackbarRegisterError"
        color='red'
      >{{ alreadyInUseMessage }}</v-snackbar>
    </v-dialog>



    <v-dialog v-model="dialogLogin" max-width="290">
      <v-card>
        <v-card-title class="headline">Σύνδεση στο λογαριασμό</v-card-title>
        <v-card-text>
        <form
          name="login-form"
          autocomplete="off">
          <v-text-field
            label="Όνομα ή email"
            v-model="credentials.email"
          ></v-text-field>
          <br>
          <v-text-field
            label="Κωδικός"
            type="password"
            v-model="credentials.password"
            autocomplete="new-password"
          ></v-text-field>
        </form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
        <v-btn
          dark
          class="cyan"
          @click="login(credentials)">
          {{login_txt}}
        </v-btn>
          <v-btn color="green darken-1" flat="flat" @click.native="dialogLogin = false">Άκυρο</v-btn>
        </v-card-actions>
      </v-card>
      <v-snackbar
        :timeout=5000
        v-model="snackbarLoginError"
        color='red'
      >{{ wrongLoginInfo }}</v-snackbar>
    </v-dialog>


    <v-dialog v-model="dialogProfile" max-width="290">
      <v-card>
        <v-card-title class="headline">Προφίλ χρήστη</v-card-title>
        <v-card-text>
          <form
          name="profile-form"
          autocomplete="off">
          <v-text-field
            label="Όνομα"
            v-model="name"
            :rules="nameRules"
            single-line
          ></v-text-field>
          <br>
          <v-text-field
            label="Παλιός Κωδικός"
            type="password"
            v-model="password"
            :rules="passRules"
            autocomplete="new-password"
          ></v-text-field>
          <br>
          <v-text-field
            label="Νέος Κωδικός"
            type="password"
            v-model="password"
            :rules="passRules"
            autocomplete="new-password"
          ></v-text-field>
          <br>
          <v-text-field
            label="Email"
            v-model="email"
            single-line
          ></v-text-field>
          <br>
          <v-text-field
            label="Γράψε αν θέλεις εδώ μια μικρή περιγραφή για σένα"
            v-model="description"
            single-line
          ></v-text-field>
        </form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
        <v-btn v-if="name.length > 0 && password.length > 0"
          dark
          class="cyan"
          @click="register">
          {{signup}}
        </v-btn>
          <v-btn color="green darken-1" flat="flat" @click.native="dialogProfile = false">Άκυρο</v-btn>
        </v-card-actions>
      </v-card>
              <v-snackbar
        :timeout=5000
        v-model="snackbarRegisterError"
        color='red'
      >{{ alreadyInUseMessage }}</v-snackbar>
    </v-dialog>


      <v-snackbar
        :timeout=5000
        v-model="snackbarLoggedIn"
        color='green'
      >{{ youAreLoggedIn }}</v-snackbar>
      <v-snackbar
        :timeout=5000
        v-model="snackbarRegistered"
        color='green'
      >{{ youAreRegistered }}</v-snackbar>

    </v-toolbar>
  </v-layout>
</template>
<script>
import axios from 'axios';
import AuthenticationService from '@/services/AuthenticationService';

export default {
  data() {
    return {
      signup: 'Εγγραφή',
      login_txt: 'Είσοδος',
      logout_txt: 'Έξοδος',
      profile_txt: 'Προφίλ',
      dialogRegister: false,
      dialogLogin: false,
      dialogProfile: false,
      email: '',
      name: '',
      password: '',
      description: '',
      snackbarRegisterError: false,
      snackbarLoginError: false,
      snackbarLoggedIn: false,
      snackbarRegistered: false,
      alreadyInUseMessage: 'Το όνομα χρησιμοποιείται από άλλο χρήστη. Διαλέξτε ένα άλλο.',
      youAreRegistered: 'Έχετε εγγραφεί!',
      youAreLoggedIn: 'Έχετε εισέλθει!',
      nameRules: [
        v => !!v || 'To όνομα είναι απαραίτητο για να προχωρήσετε.',
      ],
      passRules: [
        v => !!v || 'Ο κωδικός είναι απαραίτητος για να προχωρήσετε.',
        v => v.length > 7 || 'Ο κωδικός πρέπει να περιέχει περισσότερους από 8 χαρακτήρες, για την δική σας ασφάλεια.',
      ],
      emailRules: [
        v => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Το email πρέπει να έχει σωστή μορφή.', // eslint-disable-line no-useless-escape
      ],
      wrongLoginInfo: 'Λάθος στοιχεία εισόδου',
      credentials: {
        email: '',
        password: '',
      },
    };
  },
  methods: {
    showRegisterDialogue() {
      this.dialogRegister = true;
    },
    showLoginDialogue() {
      this.dialogLogin = true;
    },
    showProfileDialogue() {
      this.dialogProfile = true;
    },
    async register() {
      try {
        const response = await AuthenticationService.register({
          name: this.name,
          password: this.password,
          email: this.email,
          description: this.description,
        });
        // console.log('response is:: ', response);
        if (response.data.result === 'success') {
          this.dialogRegister = false;
          this.snackbarRegistered = true;
        }
        if (response.data.result === 'in use') {
          this.snackbarRegisterError = true;
        }
      } catch (error) {
        this.error = error.response.data.error;
      }
    },
    login(credentials) {
      // console.log('snack:: ', this.snackbar);
      axios.get('http://localhost:8081/v1/login', {
        params: {
          name: credentials.email,
          password: credentials.password,
        },
      })
      .then((response) => {
        // console.log('response is :: ', response);
        if (response.data.error && response.data.error === 'Login information was incorrect') {
          // console.log('data error :: ', response.data.error);
          this.snackbarLoginError = true;
          // console.log('snackbar status :: ', this.snackbarLoginError);
        }
        if (response.data.user) {
          this.user = response.data;
          this.snackbarLoggedIn = true;
          this.dialogLogin = false;
          // TODO in index.js of store create variables and mutations
          this.$store.dispatch('setToken', response.data.token);
          this.$store.dispatch('setUser', response.data.user);
        }
      });
    },
    logoutUser() {
      // console.log(this.$store.state.isUserLoggedIn);
      this.$store.dispatch('setToken', null);
      this.$store.dispatch('setUser', null);
      this.$store.dispatch('setTimeline', []);
      this.$store.dispatch('setPrivateCollections', []);
      this.$store.dispatch('setFeature', null);
      this.$store.dispatch('addNewPostFeature', null);
      this.$store.dispatch('removeNewPostFeature', null);
      this.$store.dispatch('setPostIdToAddFeatures', null);
      // console.log(this.$store.state.isUserLoggedIn);
    },
  },
};
</script>
