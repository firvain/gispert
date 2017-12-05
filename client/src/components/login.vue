<template>
  <v-layout column>
    <Pageheader></Pageheader>
    <v-flex xs6 offset-xs3>
      <h1>{{login_txt}}</h1>
      <v-container title="Register">
        <form
          name="tab-tracker-form"
          autocomplete="off">
          <v-text-field
            label="Email"
            v-model="credentials.email"
          ></v-text-field>
          <br>
          <v-text-field
            label="Password"
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
      <p>{{credentials.email}},{{credentials.password}}</p>
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
    login_txt: 'Σύνδεση',
    signup_txt: 'Εγγραφή',
    credentials: {
      email: '',
      password: '',
    },
  }),
  components: {
    Pageheader,
  },
  methods: {
    login: (credentials) => {
      axios.get('http://localhost:8081/v1/login', {
        params: {
          name: credentials.email,
          password: credentials.password,
        },
      })
      .then((response) => {
        this.user = response.data;
      })
      .catch((e) => {
        this.errors.push(e);
      });
    },
  },
};
</script>
