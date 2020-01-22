<template>
  <v-layout column>
    <!-- <Pageheader></Pageheader> -->
    <v-flex xs6 offset-xs3>
      <h1>{{ login_txt }}</h1>
      <v-container title="Register">
        <form name="tab-tracker-form" autocomplete="off">
          <v-text-field
            v-model="credentials.email"
            label="Όνομα ή email"
          ></v-text-field>
          <br />
          <v-text-field
            v-model="credentials.password"
            label="Κωδικός"
            type="password"
            autocomplete="new-password"
          ></v-text-field>
        </form>
        <br />
        <div class="danger-alert" v-html="error" />
        <br />
        <v-btn dark class="cyan" @click="login(credentials)">
          {{ login_txt }}
        </v-btn>
      </v-container>
      <v-snackbar v-model="snackbar" :timeout="5000" color="red">{{
        wrongLoginInfo
      }}</v-snackbar>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from "axios";
import Pageheader from "@/components/pageheader";
import config from "../config";

// import AuthenticationService from '@/services/AuthenticationService';

export default {
  components: {
    Pageheader
  },
  data: () => ({
    error: null,
    snackbar: false,
    login_txt: "Σύνδεση",
    signup_txt: "Εγγραφή",
    wrongLoginInfo: "Λάθος στοιχεία εισόδου",
    credentials: {
      email: "",
      password: ""
    }
  }),
  methods: {
    login(credentials) {
      // console.log('snack:: ', this.snackbar);
      const url = `${config.url}/login`;
      // console.log('connect to connect login url:: ', url);
      axios
        .get(url, {
          params: {
            name: credentials.email,
            password: credentials.password
          }
        })
        .then(response => {
          // console.log(response.data.error);
          if (response.data.error) {
            this.snackbar = true;
            // console.log(this.snackbar);
          }
          if (response.data.user) {
            this.user = response.data;
            this.$store.dispatch("setToken", response.data.token);
            this.$store.dispatch("setUser", response.data.user);
          }
        });
    }
  }
};
</script>
