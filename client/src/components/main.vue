<template>
  <v-container fluid class="pa-0">
  <Pageheader></Pageheader>
      <v-layout row wrap>
        <v-flex xs4 md4>

          <v-dialog v-model="postOpen" max-width="700px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ $t("message.post") }}</span>
              </v-card-title>
              <v-card-text>
                <post :post='postContent' v-if="postContent !== null"></post>
                <v-btn color="blue darken-1" flat @click.native="postOpen = false">{{ $t("message.close") }}</v-btn>
              </v-card-text>
            </v-card>
          </v-dialog>

          <tabs></tabs>
        </v-flex>
        <v-flex xs8 md8>
          <mapDiv></mapDiv>
        </v-flex>
      </v-layout>
      <v-footer class="pa-3">
        <v-spacer></v-spacer>
        <div>Terra Cognita Ltd, All rights reserved. © {{ new Date().getFullYear() }}</div>
      </v-footer>
  </v-container>
</template>

<script>
import Pageheader from '@/components/pageheader';
import axios from 'axios';
// import timeline from './timeline';
import tabs from './tabs';
import mapDiv from './map';
import post from './post';
import config from '../config';

export default {
  name: 'mainpage',
  components: {
    tabs, mapDiv, Pageheader, post,
  },
  data() {
    return {
      postContent: null,
      postOpen: false,
      drawer: null,
      items: [
        { title: 'Home', icon: 'dashboard' },
        { title: 'About', icon: 'question_answer' },
      ],
      right: null,
      olMap: false,
      language: 'el_GR',
    };
  },
  mounted() {
    this.olMap = true;
    this.$socket.emit('refreshPosts', 'refreshPosts');
  },
  watch: {
    '$route.params': function handle() {
      // console.log('main router changed and emitting!!!!!!', this.$route.params.id);
      if (this.$route.params.id && this.$route.name === 'searchId') {
        // console.log('loading post from permalink');
        this.loadPostFromPermalink();
      }
      // if (this.$route.params.id && this.$route.name === 'searchCollection') {
        // console.log('loading collection from permalink');
        // this.loadCollectionFromPermalink(this.$route.params.id);
      // }
      // this.$eventHub.$emit('routerChanged', 'routerChanged');
    },
  },
  methods: {
    loadPostFromPermalink() {
      this.postContent = null;
      const id = this.$route.params.id;
      let pUrl;
      let userIdCurrent;
      let token;
      let postContentNew;
      // console.log(id);
      if (this.$store.state.isUserLoggedIn) {
        pUrl = `${config.url}/posts/id`;
        userIdCurrent = this.$store.state.user.id;
        token = this.$store.state.token;
      } else {
        pUrl = `${config.url}/public/postid`;
        userIdCurrent = null;
        token = null;
      }
      if (id) {
        // console.log('before axios');
        axios.get(pUrl, {
          params: {
            pId: id,
            userId: userIdCurrent,
          },
          headers: { 'x-access-token': token },
        }).then((resp) => {
          if (resp.data) {
            // console.log(resp);
            this.postContent = resp.data[0];
            // console.log('postContent:: ', this.postContent, this.postContent.text);
            this.postOpen = true;
            // console.log('postContent:: ', this.postOpen);
            postContentNew = this.postContent;
          }
        }).then(() => {
          this.postContent = postContentNew;
          this.loading = false;
          // console.log('postContent:: ', this.postContent, this.postContent.text);
        });
      }
    },
    // loadCollectionFromPermalink(id) {
    //   console.log('loading collection from permalink');
    //   this.$eventHub.$emit('openedcollection', id);
    // },
  },

};
</script>

<style>
#main {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 0px;
  margin: 0px;
}
html {   overflow-y: hidden; }
.nopadding {
  padding: 0px !important;
}
</style>
