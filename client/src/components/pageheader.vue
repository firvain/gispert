<template>
  <v-layout column>
    <v-toolbar class="orange no-padding" dark>
      <i class="fa fa-map fa-4x"></i><v-toolbar-title><h3>Terra Cognita</h3></v-toolbar-title><h6>Collaborative Maps</h6>
      <v-spacer></v-spacer>
        <v-toolbar-items>
          <router-link to="../../register">
            <v-btn flat>
              {{signup}}
            </v-btn>
          </router-link>
          <router-link to="../../login">
            <v-btn flat>
              {{login}}
            </v-btn>
            </router-link>
        </v-toolbar-items>

      <!-- <v-btn icon large>
        <i class="fa fa-language fa-2x"></i>
      </v-btn> -->
        <!-- <v-tooltip left> -->
          <!-- <router-link to="../../login">
            <v-btn icon large>

            </v-btn>
          </router-link> -->
          <!-- <span>{{logout}}</span> -->
        <!-- </v-tooltip> -->
    </v-toolbar>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      signup: 'Εγγραφή',
      login: 'Είσοδος',
    };
  },
  methods: {
  },
};
</script>
