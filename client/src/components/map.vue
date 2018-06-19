<template>
  <div id='mw' class="mapStyle">
    <searchLocation></searchLocation>
    <div id='mapDiv' class="mapStyle"></div>
    <v-container xs3 md3 class="floating-bottom chat" v-if="currentlySelectedFeature !=='undefined' && currentlySelectedFeature !== null && this.$store.state.isUserLoggedIn">
      <div class="message-list">
        <!-- <v-chip v-for="user in usersChatting" :key="user">
          <v-avatar class="teal">A</v-avatar>
          {{ user }}
        </v-chip> -->
        <v-progress-circular v-show='loading' indeterminate v-bind:width="3" color="blue"></v-progress-circular>
        <div class="" v-for="(message, index) in messages" v-bind:key="index">
          <chat :message= 'message'></chat>
        </div>
        <v-btn
          v-if="$store.state.isUserLoggedIn && endOfMessages === false"
          v-on:click='messagesStart += 25; messagesEnd += 25; loadConversation()'
          class="blue-grey white--text"
          block
        >
          {{ $t("message.loadMore")}}
          <v-icon right dark>navigate_next</v-icon>
        </v-btn>
      
      </div>
      <v-layout row>
      <v-flex xs10 md10>
        <v-text-field
          name="input-1"
          :label="new_message_label"
          id="testing"
          width='50'
          v-on:keyup.enter="sendMessage"
          v-model="message_content"
        ></v-text-field>
      </v-flex>
      <v-flex xs2 md2>
        <v-btn fab dark small color="green">
          <v-icon dark>send</v-icon>
        </v-btn>
      </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>
<script>
import ol from 'openlayers';
import axios from 'axios';
import chat from './chat';
import config from '../config';
import olMap from '../js/map';
import searchLocation from './searchLocation';

export default {
  name: 'mw',
  data: () => ({
    new_message_label: 'Νέο Μήνυμα',
    send_label: 'Αποστολή',
    message_content: '',
    items: [],
    messages: [],
    usersChatting: [],
    messagesStart: 0,
    messagesEnd: 25,
    featuresStart: 0,
    featuresEnd: 25,
    endOfMessages: false,
  }),
  components: {
    searchLocation, olMap, chat,
  },
  computed: {
    newFeature() {
      return this.$store.state.newpostfeature;
    },
    currentlySelectedFeature() {
      let feature = {};
      if (typeof this.$store.state.feature !== 'undefined') {
        feature = this.$store.state.feature;
      } else {
        feature = null;
      }
      return feature;
    },
    currentMessages() {
      let messages = '';
      if (Object.keys(this.$store.state.feature).length > 0) {
        const featureKeys = this.$store.state.feature.getKeys();
        if (featureKeys.indexOf('messages') > 0) {
          messages = [];
          messages = this.$store.state.feature.get('messages').split('\n');
        }
      } else {
        messages = [];
      }
      this.messages = this.$store.state.feature.get('messages').split('\n');
      return messages;
    },
  },
  methods: {
    sendMessage() {
      if (this.content !== '') {
        const message = {
          userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
          userName: this.$store.state.user.name,
          content: this.message_content,
          date: new Date(),
          featureId: this.$store.state.feature.get('mongoID'),
        };
        this.$socket.emit('featureMessage', message);
        this.addToConversation(message).then(() => {
          this.loading = false;
        });
        this.messages.unshift(message);
        console.log('feature message emitted::', JSON.stringify(message));
        this.message_content = '';
      }
    },
    newFeatureMessage(msg) {
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach((layer) => {
        if (layer.getProperties().name === 'customLayer') {
          let alreadyExists = false;
          layer.getSource().forEachFeature((feature) => {
            console.log('feature to add:: ', JSON.stringify(msg));
            if (feature.get('mongoID') === msg.featureId) {
              alreadyExists = true;
              console.log('setting properties', msg.userName, msg.content);
              feature.setProperties({ messages: `${msg.userName}: ${msg.content}` });
              this.messages.unshift(msg);
            }
          });
          if (alreadyExists === false) {
            console.log('must ajax it');
          }
        }
      });
    },
    addNewGeometry(msg) {
      const geojsonFormat = new ol.format.GeoJSON();
      const AddedFeature = geojsonFormat.readFeatures(msg.feature);
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach((layer) => {
        if (layer.getProperties().name === 'customLayer') {
          layer.getSource().addFeatures(AddedFeature);
        }
      });
    },
    newGeometryDrawn(feature) {
      console.log('send this feature to db:: ', feature);
      try {
        const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/conversations/feature`;
        axios.post(url, { feature }, { headers: { 'x-access-token': this.$store.state.token } });
      } catch (error) {
        console.log(error);
      }
      return true;
    },
    loadLiveGeodata() {
      try {
        const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/conversations/feature`;
        console.log('load live geodata for::', this.$store.state.liveUsersList);
        const users = this.$store.state.liveUsersList;
        // console.log(users, typeof (users));
        axios.get(url, {
          params: {
            userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
            userList: users,
            start: this.featuresStart,
            end: this.featuresEnd,
          },
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          console.log('response status:: ', response.status);
          if (response.status === 200) {
            if (response.data.length > 0) {
              console.log('data:: ', response.data);
              response.data.forEach((f) => {
                // console.log('message:: ', f.feature);
                this.addNewGeometry(f.feature);
              });
            }
          } else {
            console.log('error');
          }
        });
      } catch (error) {
        console.log(error);
      }
      return true;
    },
    async loadConversation(newSelection) {
      try {
        if (newSelection) {
          this.messages = [];
        }
        if (this.$store.state.feature) {
          const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/conversations`;
          axios.get(url, {
            params: {
              featureId: this.$store.state.featureId,
              start: this.messagesStart,
              end: this.messagesEnd,
            },
            headers: { 'x-access-token': this.$store.state.token },
          }).then((response) => {
            console.log('response status:: ', response.status);
            if (response.status === 200 && response.data.length > 0) {
              console.log('data:: ', response.data);
              response.data.forEach((r) => {
                // console.log('message:: ', r.message);
                this.messages.push(r.message);
              });
            } else {
              console.log('error');
              this.loading = false;
              this.endOfMessages = true;
            }
          });
        }
      } catch (error) {
        console.log(error);
        this.loading = false;
      }
      return true;
    },
    async addToConversation(data) {
      try {
        this.loading = true;
        const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/conversations`;
        axios.post(url, { data }, {
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          if (response.status === 200) {
            this.loading = false;
          } else {
            console.log('error');
          }
          this.loading = false;
        });
      } catch (error) {
        console.log(error);
      }
      return true;
    },
  },
  watch: {
    '$store.state.featureId': function handle() {
      console.log('new feature selection');
      this.start = 0;
      this.end = 25;
      this.loading = true;
      this.loadConversation(true).then(() => {
        this.loading = false;
      });
    },
    '$store.state.liveUsersList': function handle() {
      console.log('load live geodata');
      this.loading = true;
      this.loadLiveGeodata().then(() => {
        this.loading = false;
      });
    },
    newFeature: function emit() {
      console.log('newpostfeature changed', typeof (this.$store.state.addingToPost));
      const geojson = new ol.format.GeoJSON();
      if (this.$store.state.addingToPost === undefined) {
        const msg = {
          userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
          feature: geojson.writeFeature(this.$store.state.newpostfeature),
        };
        console.log('sending feature to followers', msg);
        this.$socket.emit('newGeometry', msg);
        this.newGeometryDrawn(msg);
      } else {
        console.log('not undefined');
      }
    },
  },
  mounted() {
    olMap.setTarget('mapDiv');
    // this.$options.sockets.userJoinedChat = (data) => {
    //   console.log('user joined::', data);
    //   this.usersChatting.push(data);
    // };
    this.$options.sockets.newFeatureMessage = (data) => {
      this.newFeatureMessage(data);
    };
    this.$options.sockets.newGeometry = (data) => {
      this.addNewGeometry(data);
    };
  },
};
</script>
<style lang="scss">
  .mapStyle {
    width: auto;
    height: 100%;
    height: 90vh;
  }
  .ol-zoom {
    left: unset;
    right: 8px;
    top: 50px;
    background-color: rgba(255,255,255,0);
    &:hover {
    background-color: rgba(255,255,255,0);
    }
    .ol-zoom-in {
      background-color: rgba(96, 125, 139, .5);
      border-radius: 50%;
    }
    .ol-zoom-out {
      background-color: rgba(96, 125, 139, .5);
      border-radius: 50%;
      top: .5em;
      position: relative;
    }
  }
  .ol-touch .ol-control button {
  font-size: 1.14em;
  }
  .ol-control button {
  font-size: 1.5em;
   &:hover {
     background-color: red;
   }
  }

  .floating-bottom {
    position: absolute;
    left: 55%;
    bottom: 2%;
    width: 400px;
    background-color: white;
    overflow-y: auto;
  }

  .message-list {
    overflow-y: auto;
    max-height: 150px;
    padding: 0px;
    margin: 0px;
    font-size: 0.55em !important;
  }
</style>
