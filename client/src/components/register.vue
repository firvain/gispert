<template>
  <v-layout column>
    <Pageheader></Pageheader>
    <v-flex xs6 offset-xs3>
      <h1>{{signup}}</h1>
        <form
          name="tab-tracker-form"
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
        <br>
        <div class="danger-alert" v-html="error" />
        <br>
        <v-btn v-if="name.length > 0 && password.length > 0"
          dark
          class="cyan"
          @click="register">
          {{signup}}
        </v-btn>
        <v-snackbar
        :timeout=5000
        v-model="snackbar"
        color='red'
      >{{ alreadyInUseMessage }}</v-snackbar>
    </v-flex>
  </v-layout>
</template>

<script>
import Pageheader from '@/components/pageheader';
import AuthenticationService from '@/services/AuthenticationService';

export default {
  data() {
    return {
      email: '',
      name: '',
      password: '',
      description: '',
      error: null,
      login: 'Σύνδεση',
      signup: 'Εγγραφή',
      snackbar: false,
      alreadyInUseMessage: 'Το όνομα χρησιμοποιείται από άλλο χρήστη. Διαλέξτε ένα άλλο.',
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
    };
  },
  components: {
    Pageheader,
  },
  methods: {
    async register() {
      try {
        const response = await AuthenticationService.register({
          name: this.name,
          password: this.password,
          email: this.email,
          description: this.description,
        });
        // eslint-disable-next-line
        console.log('response is:: ', response);
        if (response.data.result === 'success') {
          this.$router.push({
            name: 'login',
          });
        }
        if (response.data.result === 'in use') {
          this.snackbar = true;
        }
      } catch (error) {
        this.error = error.response.data.error;
      }
    },
  },
};
</script>
