<template>
  <v-layout column>
    <v-toolbar class="orange lighten-2 no-padding" dark>
      <i class="fa fa-map fa-2x"></i><h1>Geobabel</h1>
      <v-spacer></v-spacer>
        <v-toolbar-items>
            <!-- <v-text-field
              name="postSearch"
              :label="$t('message.search')"
              v-model="postSearch"
              min="8"
              append-icon='search'
              v-on:keyup.enter="searchInPosts"
            ></v-text-field> -->
            <!-- <placesResults :results='osmResults' offset-sm3></placesResults> -->
            <v-btn flat @click='showRegisterDialogue' v-if="$store.state.isUserLoggedIn === false && $store.state.questionnaireMode !== 'answering'">
              {{ $t("message.register") }}
            </v-btn>
            <v-btn flat @click='showLoginDialogue' v-if="$store.state.isUserLoggedIn === false && $store.state.questionnaireMode !== 'answering'">
              {{ $t("message.login") }}
            </v-btn>
              <!-- {{notificationsBell.number}}{{notificationsBell.color}},  -->
              <!-- {{$store.state.notifications.length}} :: {{notificationsGetter}} -->
              <v-btn flat dark @click="dialogNotifications = true" v-if="$store.state.isUserLoggedIn === true">
                <v-badge left color='blue'>
                  <span slot="badge" color='blue' v-if='bell.number > 0'>{{ bell.number }}</span>
                  <v-icon :color='bell.color'>notifications</v-icon>
                </v-badge>
              </v-btn>

            <v-btn flat @click='showProfileDialogue' v-if="$store.state.isUserLoggedIn === true">
              {{$store.state.user.name}}
            </v-btn>
            <!-- <v-btn flat @click='showProfileDialogue' v-if="$store.state.isUserLoggedIn === true">
              {{profile_txt}}
            </v-btn> -->
            <v-btn flat @click='logoutUser' v-if="$store.state.isUserLoggedIn === true">
              {{ $t("message.logout") }}
            </v-btn>
        </v-toolbar-items>
        <v-flex md1 v-if="$store.state.questionnaireMode !== 'answering'">
          <v-select
            class="top"
            @change="setLocale"
            v-bind:items="languages"
            item-text="name"
            item-value="id"
            v-model="language"
            label="Select"
            single-line
            menu-props='bottom'
          ></v-select>
        </v-flex>

      <v-dialog v-model="dialogRegister" max-width="400">
        <!-- <v-tabs icons grow dark> -->
          <!-- <v-tabs-bar class="orange"> -->
            <!-- <v-tabs-slider color="yellow"></v-tabs-slider> -->
            <!-- <v-tabs-item href="#tab-1">
              <v-icon>account_circle</v-icon>
              {{ $t("message.existingAccount") }}
            </v-tabs-item> -->
            <!-- <v-tabs-item href="#tab-2"> -->
              <!-- <v-icon>control_point</v-icon>
              {{ $t("message.newAccount") }} -->
            <!-- </v-tabs-item> -->
          <!-- </v-tabs-bar> -->
          <!-- <v-tabs-items> -->
            <!-- <v-tabs-content
              id="tab-1"
            > -->
            <!-- </v-tabs-content>
            <v-tabs-content
              id="tab-2"
            > -->
              <v-card>
                <v-card-title class="headline">{{ $t("message.registerUserText") }}</v-card-title>
                <v-card-text>
                  <v-form ref="form" lazy-validation
                  name="register-form"
                  autocomplete="off">
                  <v-text-field
                    :label="$t('message.name')"
                    v-model="name"
                    :rules="nameRules"
                    single-line
                  ></v-text-field>
                  <br>
                  <v-text-field
                    :label="$t('message.password')"
                    type="password"
                    v-model="password"
                    :rules="passRules"
                    autocomplete="new-password"
                  ></v-text-field>
                  <br>
                  <v-text-field
                    label="Email"
                    v-model="email"
                    :rules= "emailRules"
                    single-line
                  ></v-text-field>
                  <br>
                  <v-text-field
                    :label="$t('message.userDescriptionHint')"
                    v-model="description"
                    single-line
                  ></v-text-field>
                </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn v-if="name.length > 0 && password.length > 0"
                    dark
                    class="cyan"
                    @click="register">
                    {{ $t("message.register")}}
                  </v-btn>
                  <v-btn color="green darken-1" flat="flat" @click.native="dialogRegister = false;">
                    {{ $t("message.cancel")}}
                  </v-btn>
                </v-card-actions>
              </v-card>
            <!-- </v-tabs-content>
          </v-tabs-items>
        </v-tabs> -->
      </v-dialog>
        <v-snackbar
          :timeout=5000
          v-model="snackbarRegisterError"
          color='red'
        >{{ $t("message.alreadyInUseMessage") }}</v-snackbar>



      <v-dialog v-model="dialogLogin" max-width="400">
        <v-card>
          <v-card-title class="headline">{{ $t("message.accountLogin")}}</v-card-title>
          <v-container>
            <v-text-field
              :label = "$t('message.name')"
              v-model="credentials.email"
              v-on:keyup.enter="login(credentials)"
            ></v-text-field>
            <v-text-field
              :label="$t('message.password')"
              type="password"
              v-model="credentials.password"
              autocomplete="new-password"
              v-on:keyup.enter="login(credentials)"
            ></v-text-field>
              <v-btn
                dark
                class="cyan"
                @click="login(credentials)">
                {{ $t("message.login")}}
              </v-btn>
              <v-btn color="green darken-1" flat="flat" @click.native="dialogLogin = false">{{ $t("message.cancel")}}</v-btn>
            <!-- <v-spacer></v-spacer> -->
          </v-container> <hr>
              <v-flex class="text-xs-center">Ή είσοδος με τον λογαριασμό σας </v-flex>
              <v-btn block flat @click="auth('google')">
                <i class="fa fa-fw fa-google"></i>
                Google
              </v-btn>
              <!-- <v-btn block flat @click="auth('facebook')">
                <i class="fa fa-fw fa-facebook"></i>
                Facebook
              </v-btn> -->
              <!-- <v-btn block flat @click="auth('linkedin')">
                <i class="fa fa-fw fa-linkedin"></i>
                Linkedin
              </v-btn>
              <v-btn block flat @click="auth('twitter')">
                <i class="fa fa-fw fa-twitter"></i>
                Twitter
              </v-btn> -->
              <!-- <v-btn @click="auth('github')">Github</v-btn> -->
        </v-card>
        <v-snackbar
          :timeout=5000
          v-model="snackbarLoginError"
          color='red'
        >{{ wrongLoginInfo }}</v-snackbar>
      </v-dialog>


      <v-dialog v-model="dialogProfile" max-width="290">
        <v-card>
          <v-card-title class="headline">{{ $t("message.profile") }}</v-card-title>
          <v-card-text>
            <form
            name="profile-form"
            autocomplete="off">
            <!-- <v-text-field
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
            <br> -->
            <v-text-field
              label="Email"
              v-model="emailEdit"
              single-line
            ></v-text-field>
            <br>
            <v-text-field
              :label="$t('message.userDescriptionHint')"
              v-model="descriptionEdit"
              single-line
            ></v-text-field>
          </form>
          <!-- <v-btn block outline @click='exploreTimeline'>
            My map
          </v-btn> -->
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              dark
              class="cyan"
              @click="updateProfile">
              {{ $t("message.save") }}
            </v-btn>
            <v-btn color="green darken-1" flat="flat" @click.native="dialogProfile = false">
              {{ $t("message.cancel") }}
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-snackbar
          :timeout=5000
          v-model="snackbarRegisterError"
          color='red'
        >{{ $t("message.alreadyInUseMessage") }}</v-snackbar>
      </v-dialog>

      <v-snackbar
        :timeout=5000
        v-model="snackbarLoggedIn"
        color='green'
      >{{ $t("message.youAreLoggedIn") }}</v-snackbar>
      <v-snackbar
        :timeout=5000
        v-model="snackbarRegistered"
        color='green'
      >{{ $t("message.youAreRegistered") }}</v-snackbar>
      <v-snackbar
        :timeout=5000
        v-model="snackbarSetLocale"
        color='green'
      >OK</v-snackbar>

      <v-dialog v-model="dialogNotifications" max-width="500px">
        <notificationsList v-if='$store.state.isUserLoggedIn'></notificationsList>
      </v-dialog>

      <v-dialog v-model="landingPageOpen" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="display-1"> Welcome!
              <!-- {{ $t("message.post") }} -->
            </span>
            <v-spacer></v-spacer>
            <v-select
              class="top"
              @change="setLocale"
              v-bind:items="languages"
              item-text="name"
              item-value="id"
              v-model="language"
              label="Select"
              single-line
              menu-props='bottom'
            ></v-select>

          </v-card-title>
          <v-card-text>
            <div class="title">Crowdsourcing</div>
            <div class="body-1">Are you in planning industry? Maybe you want to ask for citizen opinions.
              Create questions and share them on social media for larger audience</div>
            <div class="title">Geodata Storage</div>
            <div class="body-1">You need a place to store notes with spatial reference?</div>
            <div class="title">Talk about locations</div>
            <div class="body-1">You need to talk about a place with a friend or colleague? Organize your trip,
              show them a place, guide them to a location with interactive chat on the map.</div>
            <div class="title">Real-time mapping</div>
            <div class="body-1">Create maps collaborating in real time with friends or colleagues.</div>
            <v-flex>
              <v-btn flat @click='showRegisterDialogue' v-if="$store.state.isUserLoggedIn === false">
                {{ $t("message.register") }}
              </v-btn>
              <v-btn flat @click='showLoginDialogue' v-if="$store.state.isUserLoggedIn === false">
                {{ $t("message.login") }}
              </v-btn>
              <a class="caption">Why register?</a>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-dialog>

    </v-toolbar>
  </v-layout>
</template>
<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
// import AuthenticationService from '@/services/AuthenticationService';
// import placesResults from '@/components/places_results';
import olMap from '../js/map';
import config from '../config';
import { app } from '../main';
import notificationsList from './notificationsList';

export default {
  data() {
    return {
      dialogWelcome: true,
      dialogRegister: false,
      dialogLogin: false,
      dialogProfile: false,
      dialogNotifications: false,
      // notificationsBell: { color: 'white', number: 1 },
      email: '',
      emailEdit: '',
      descriptionEdit: '',
      name: '',
      password: '',
      description: '',
      snackbarRegisterError: false,
      snackbarLoginError: false,
      snackbarLoggedIn: false,
      snackbarRegistered: false,
      snackbarSetLocale: false,
      nameRules: [
        v => !!v || this.$t('message.userNameMissing'),
      ],
      passRules: [
        v => !!v || this.$t('message.passwordMissing'),
        v => v.length > 7 || this.$t('message.passwordWeak'),
      ],
      emailRules: [
        v => !!v || this.$t('message.emailMissing'),
        v => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || this.$t('message.emailErrorFormat'), // eslint-disable-line no-useless-escape
      ],
      wrongLoginInfo: this.$t('message.credentialsError'),
      credentials: {
        email: '',
        password: '',
      },
      language: { id: 'en', name: 'English' },
      languages: [
        { id: 'en', name: 'English' },
        { id: 'fr', name: 'Français' },
        { id: 'el_GR', name: 'Ελληνικά' },
        { id: 'de', name: 'Deutsche' },
        { id: 'it', name: 'Italiano' },
        { id: 'es', name: 'Español' },
        { id: 'nn', name: 'Norsk' },
      ],
      currentBell: null,
      postSearch: '',
      osmResults: null,
    };
  },
  computed: {
    ...mapGetters({
      bell: 'notificationsGetter',
    }),
    landingPageOpen: {
      get: function get() {
        let open = false;
        if (this.$store.state.isUserLoggedIn) {
          open = false;
        }
        if (!this.$store.state.isUserLoggedIn && this.$route.params) {
          open = false;
        }
        if (!this.$store.state.isUserLoggedIn && !this.$route.params) {
          open = true;
        }
        return open;
      },
      set: function set() {
        return true;
      },
    },
  },
  components: {
    notificationsList, /* placesResults, */
  },
  watch: {
    bell: (e) => {
      this.currentBell = e;
      console.log('new bell', this.currentBell);
    },
  },
  methods: {
    auth(network) {
      const hello = this.hello;
      hello(network).login().then(() => {
        this.dialogLogin = false;
        // const authRes = hello(network).getAuthResponse();
        // console.log('auth res:: ', authRes);
        hello(network).api('me').then((json) => {
          // console.log('getting profile');
          const profile = json;
          // console.log('profile:: ', profile);
          // const authresponse = hello(network).getAuthResponse();
          // console.log('response auth:: ', authresponse);
          return profile;
        }).then((profile) => {
          const url = `${config.url}/login/social`;
          axios.get(url, {
            params: {
              name: profile.name,
              id: profile.id,
              email: profile.email,
            },
          }).then((response) => {
            if (response.data.success === false) {
              console.log(response.data);
            } else {
              this.user = response.data;
              this.snackbarLoggedIn = true;
              this.dialogLogin = false;
              this.$store.dispatch('setToken', response.data.token);
              this.$store.dispatch('setUser', response.data.user);
              this.$eventHub.$emit('logged-in');
            }
          }).then(() => {
            const urlUsers = `${config.url}/users/all`;
            axios.get(urlUsers, {
              params: {
                userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
                pageFrom: 0,
                pageTo: 25,
              },
              headers: { 'x-access-token': this.$store.state.token },
            }).then((response) => {
              if (response.data.success === false) {
                console.log(response.data);
                console.log('not logged in to see others');
              } else {
                this.$store.dispatch('setUsers', response.data);
                // this.users = response.data;
              }
            }).then(() => {
              console.log('connected as ::', this.$store.state.user.name);
              this.loadPublicCollections();
              this.loadPrivateCollections();
              this.loading = false;
              // this.loadLiveUsers();
            }).then(() => {
              this.$socket.emit('userConnected', this.$store.state.user._id); // eslint-disable-line no-underscore-dangle
              this.loading = false;
            });
          });
        });
      });
    },
    exploreTimeline(userId) {
      const tl = {
        id: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        type: 'timeline',
      };
      this.$store.dispatch('setOpenedCustomTimeline', tl);
      console.log('explore:: ', userId);
      this.$store.commit('setActiveTab', 'explore');
      // this.$router.push({ path: `/main/search/usertimeline/${userId}` });
    },
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
      if (this.$refs.form.validate()) {
        console.log('is valid');
        try {
          const url = `${config.url}/register`;
          console.log(url);
          const data = {
            name: this.name,
            password: this.password,
            email: this.email,
            description: this.description,
          };
          axios.post(url, { data }).then((response) => {
            if (response.data.result === 'success') {
              this.dialogRegister = false;
              this.snackbarRegistered = true;

              console.log('trying to login :: ', this.credentials.email, this.credentials.password);
              const registeredCredentials = {
                email: this.name,
                password: this.password,
              };
              this.login(registeredCredentials);
            }
            if (response.data.result === 'in use') {
              this.snackbarRegisterError = true;
            }
          });
          // const response = await AuthenticationService.register({
          //   name: this.name,
          //   password: this.password,
          //   email: this.email,
          //   description: this.description,
          // });
          // console.log('response is:: ', response);
        } catch (error) {
          this.error = error.response.data.error;
        }
      } else {
        console.log('invalid');
      }
    },
    login(credentials) {
      // console.log('snack:: ', this.snackbar);
      const url = `${config.url}/login`;
      axios.get(url, {
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
          this.$eventHub.$emit('logged-in');
          this.emailEdit = this.$store.state.user.email;
          this.descriptionEdit = this.$store.state.user.description;
          // this.setLocale(response.data.user.locale);
          this.language = response.data.user.locale;
          app.$i18n.locale = response.data.user.locale;
        }
      })
      .then(() => {
        console.log('loading users in pageheader!');
        if (this.$store.state.users.length === 0) {
          this.loading = true;
          const urlUsers = `${config.url}/users/all`;
          axios.get(urlUsers, {
            params: {
              userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
              pageFrom: 0,
              pageTo: 25,
            },
            headers: { 'x-access-token': this.$store.state.token },
          }).then((response) => {
            if (response.data.success === false) {
              console.log(response.data);
              console.log('not logged in to see others');
            } else {
              this.$store.dispatch('setUsers', response.data);
              // this.users = response.data;
            }
          }).then(() => {
            console.log('connected as ::', this.$store.state.user.name);
            this.loadPublicCollections();
            this.loadPrivateCollections();
            this.loading = false;
            // this.loadLiveUsers();
          }).then(() => {
            this.$socket.emit('userConnected', this.$store.state.user._id); // eslint-disable-line no-underscore-dangle
            this.loading = false;
          });
        }
      });
    },
    async loadPrivateCollections() {
      try {
        // this.loading = true;
        const vuexCollections = this.$store.state.privateCollections;
        if (vuexCollections && vuexCollections.length > 0) {
          this.privateCollections = this.$store.state.privateCollections;
        }
        const url = `${config.url}/collections`;
        axios.get(url, {
          params: {
            userId: this.getUserId(),
          },
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          this.loading = false;
          this.privateCollections = response.data;
        }).then(() => {
          this.loading = false;
          this.$store.dispatch('setPrivateCollections', this.privateCollections);
          const collectionIds = [];
          this.privateCollections.forEach((c) => {
            collectionIds.push(c._id); // eslint-disable-line no-underscore-dangle
          });
          console.log('joining collections', JSON.stringify(this.privateCollections));
          this.$socket.emit('joinCollections', collectionIds);
        });
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
      return true;
    },
    async loadPublicCollections() {
      try {
        // this.loading = true;
        const vuexCollections = this.$store.state.publicCollections;
        if (vuexCollections && vuexCollections.length > 0) {
          this.publicCollections = this.$store.state.publicCollections;
        }
        const url = `${config.url}/public/collections`;
        axios.get(url, {
          params: {
            userId: this.getUserId(),
          },
        }).then((response) => {
          this.loading = false;
          this.publicCollections = response.data;
          // console.log('public collections fetched:: ', this.publicCollections);
        }).then(() => {
          this.loading = false;
          this.$store.dispatch('setPublicCollections', this.publicCollections);
          const collectionIds = [];
          this.publicCollections.forEach((c) => {
            collectionIds.push(c._id); // eslint-disable-line no-underscore-dangle
          });
          // console.log('joining collections', JSON.stringify(this.publicCollections));
          this.$socket.emit('joinCollections', collectionIds);
        });
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
      return true;
    },
    // async loadLiveUsers() {
    //   try {
    //     this.loading = true;
    //     const url = `${config.url}/users/LiveMapChatForUser`;
    //     axios.get(url, {
    //       params: {
    //         id: this.getUserId(),
    //       },
    //       headers: { 'x-access-token': this.$store.state.token },
    //     }).then((response) => {
    //       this.loading = false;
    //       console.log('joining liveUsers', JSON.stringify(response.data));
    //       console.log('joining liveUsers', JSON.stringify(response.data[0].liveUsers));
    //       this.$store.dispatch('setLiveUsers', response.data[0].liveUsers);
    //       this.$socket.emit('joinCollections', response.data[0].liveUsers);
    //       this.$socket.emit('joinCollections', [this.$store.state.user._id]);
    // eslint-disable-line no-underscore-dangle
    //     });
    //   } catch (error) {
    //     console.log(error);
    //   }
    //   return true;
    // },
    getUserId() {
      let id;
      if (this.$store.state.user) { // eslint-disable-line no-underscore-dangle
        id = this.$store.state.user._id; // eslint-disable-line no-underscore-dangle
      } else {
        id = null;
      }
      return id;
    },
    updateProfile() {
      const url = `${config.url}/users/updateprofile`;
      const updateInfo = {
        id: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        email: this.emailEdit,
        description: this.descriptionEdit,
      };
      axios.post(url, { updateInfo }, {
        headers: { 'x-access-token': this.$store.state.token },
      })
      .then(() => {
        this.dialogProfile = false;
      });
    },
    logoutUser() {
      this.$socket.emit('userDisconnected', this.$store.state.user._id); // eslint-disable-line no-underscore-dangle
      // console.log(this.$store.state.isUserLoggedIn);
      this.$store.dispatch('setToken', null);
      this.$store.dispatch('setUser', null);
      this.$store.dispatch('setTimeline', []);
      this.$store.dispatch('setPrivateCollections', []);
      this.$store.dispatch('setPublicCollections', []);
      this.$store.commit('addingToPost', undefined);
      this.$store.dispatch('resetFeatureCount', 0);
      // this.$store.dispatch('setCustomMaps', 'empty');
      this.$store.dispatch('setUsers', 'empty');
      this.$store.dispatch('setNotifications', []);
      this.$store.dispatch('setOpenedCustomTimeline', null);
      this.$store.dispatch('setUserTimeline', null);
      this.$store.dispatch('setCollectionTimeline', null);
      this.$store.commit('setMyQuestionnaires', null);
      this.$store.commit('setQuestionnairesIHaveAnswered', null);
      // this.$store.dispatch('setLiveUsers', null);
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach((layer) => {
        if (layer.getProperties().name === 'customLayer') {
          layer.getSource().clear();
        }
      });
      // this.$store.dispatch('setFeature', null);
      // this.$store.dispatch('addNewPostFeature', null);
      // this.$store.dispatch('removeNewPostFeature', null);
      // this.$store.dispatch('setPostIdToAddFeatures', null);
      // console.log(this.$store.state.isUserLoggedIn);
    },
    setLocale(value) {
      // console.log('setting locale to ::', value);
      app.$i18n.locale = value;
      if (this.$store.state.isUserLoggedIn) {
        const url = `${config.url}/users/setlocale`;
        const updateInfo = {
          id: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
          locale: value,
        };
        axios.post(url, { updateInfo }, {
          headers: { 'x-access-token': this.$store.state.token },
        })
        .then((response) => {
          // console.log(response);
          if (response.statusText === 'OK') {
            this.snackbarSetLocale = true;
          }
        });
      }
    },
    async searchInPosts() {
      try {
        this.loading = true;
        const url = 'https://nominatim.openstreetmap.org/?addressdetails=1&format=json&limit=1';
        axios.get(url, {
          params: {
            q: this.postSearch,
            format: 'json',
          },
        }).then((response) => {
          this.osmResults = response.data;
        }).then(() => {
          this.loading = false;
        });
      } catch (error) {
        console.log(error);
      }
      return true;
    },
  },
  mounted() {
    // this.$options.sockets.unfollowedCollection = (data) => {
    //   console.log('unfollowedCollection', data);
    // };
    // this.$options.sockets.room = (data) => {
    //   console.log('room:: ', data);
    // };
  },
};
</script>
<style scoped>
  v-tabs-item {
    color : white;
  }
  .top {
    z-index: 999999;
  }
</style>
