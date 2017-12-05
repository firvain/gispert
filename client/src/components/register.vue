<template>
  <v-layout column>
    <Pageheader></Pageheader>
    <v-flex xs6 offset-xs3>
      <h1>{{signup}}</h1>
        <form
          name="tab-tracker-form"
          autocomplete="off">
          <v-text-field
            label="Email"
            v-model="email"
          ></v-text-field>
          <br>
          <v-text-field
            label="Password"
            type="password"
            v-model="password"
            autocomplete="new-password"
          ></v-text-field>
        </form>
        <br>
        <div class="danger-alert" v-html="error" />
        <br>
        <v-btn
          dark
          class="cyan"
          @click="register">
          {{signup}}
        </v-btn>
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
      password: '',
      error: null,
      login: 'Σύνδεση',
      signup: 'Εγγραφή',
    };
  },
  components: {
    Pageheader,
  },
  methods: {
    async register() {
      try {
        const response = await AuthenticationService.register({
          name: this.email,
          password: this.password,
        });
        this.$store.dispatch('setToken', response.data.token);
        this.$store.dispatch('setUser', response.data.user);
        this.$router.push({
          name: 'songs',
        });
      } catch (error) {
        this.error = error.response.data.error;
      }
    },
  },
};
</script>
