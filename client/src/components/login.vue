<template>
  <v-layout column>
    <!-- <Pageheader></Pageheader> -->
    <v-flex xs6 offset-xs3>
      <h1>{{login_txt}}</h1>
      <v-container title="Register">
        <form
          name="tab-tracker-form"
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
        <br>
        <div class="danger-alert" v-html="error" />
        <br>
        <v-btn
          dark
          class="cyan"
          @click="login(credentials)">
          {{login_txt}}
        </v-btn>
      </v-container>
      <v-snackbar
        :timeout=5000
        v-model="snackbar"
        color='red'
      >{{ wrongLoginInfo }}</v-snackbar>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from 'axios';
import Pageheader from '@/components/pageheader';
// import AuthenticationService from '@/services/AuthenticationService';

export default {
  data: () => ({
    error: null,
    snackbar: false,
    login_txt: 'Σύνδεση',
    signup_txt: 'Εγγραφή',
    wrongLoginInfo: 'Λάθος στοιχεία εισόδου',
    credentials: {
      email: '',
      password: '',
    },
  }),
  components: {
    Pageheader,
  },
  methods: {
    login(credentials) {
      // console.log('snack:: ', this.snackbar);
      axios.get('http://localhost:8081/v1/login', {
        params: {
          name: credentials.email,
          password: credentials.password,
        },
      })
      .then((response) => {
        // console.log(response.data.error);
        if (response.data.error) {
          this.snackbar = true;
          // console.log(this.snackbar);
        }
        if (response.data.user) {
          this.user = response.data;
          // TODO in index.js of store create variables and mutations
          this.$store.dispatch('setToken', response.data.token);
          this.$store.dispatch('setUser', response.data.user);
        }
      });
    },
  },
};
</script>
