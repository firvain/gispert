<template>
  <div id='mw' class="mapStyle">
    <searchLocation></searchLocation>
    <div id='mapDiv' class="mapStyle"></div>
    <v-container xs3 md3 class="floating-bottom chat" v-if="currentlySelectedFeature !=='undefined' && currentlySelectedFeature !== null && this.$store.state.isUserLoggedIn">
      <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
      <v-list class="message-list">
        <!-- <v-chip v-for="user in usersChatting" :key="user">
          <v-avatar class="teal">A</v-avatar>
          {{ user }}
        </v-chip> -->
        <v-list-tile class="" v-for="message in messages" v-bind:key="message.date">
          <v-flex xs6 sm4 :offset-xs6="message.userId === $store.state.user._id" :offset-sm8="message.userId === $store.state.user._id">
            <v-card class="message" :color="message.userId !== $store.state.user._id ? 'white' : 'blue' ">
              <v-card-text :class="message.userId !== $store.state.user._id ? 'black--text' : 'white--text' ">
                {{ message.userName }} {{message.content}}
              </v-card-text>
            </v-card>
          </v-flex>
        </v-list-tile>
      </v-list>
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
  }),
  components: {
    searchLocation, olMap,
  },
  computed: {
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
        this.addToConversation(message);
        // this.messages.push(`${message.userName}: ${message.content}
        // (${message.date.getHours()}:${message.date.getMinutes()}:${message.date.getSeconds()})`);
        this.messages.push(message);
        console.log('feature message emitted::', message);
        this.message_content = '';
      }
    },
    newFeatureMessage(msg) {
      // if feature open add to dialog box else search in map
      // const date = new Date(data.date);
      // this.messages.push(`${data.userName}: ${data.content}
      // (${date.getHours()}:${date.getMinutes()}:${date.getSeconds()})`);
      let allLayers = [];
      allLayers = olMap.getLayers().getArray();
      allLayers.forEach((layer) => {
        if (layer.getProperties().name === 'customLayer') {
          let alreadyExists = false;
          layer.getSource().forEachFeature((feature) => {
            console.log('feature to add:: ', msg);
            if (feature.get('mongoID') === msg.featureId) {
              alreadyExists = true;
              console.log('setting properties', msg.userName, msg.content);
              feature.setProperties({ messages: `${msg.userName}: ${msg.content}` });
              this.messages.push(msg);
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
    loadConversation() {
      try {
        this.loading = true;
        this.messages = [];
        const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/conversations`;
        axios.get(url, {
          params: {
            featureId: this.$store.state.featureId,
          },
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          console.log('response status:: ', response.status);
          if (response.status === 200) {
            console.log('data:: ', response.data);
            response.data.forEach((r) => {
              console.log('message:: ', r.message);
              this.messages.push(r.message);
            });
            this.loading = false;
          } else {
            console.log('error');
            this.loading = false;
          }
          // console.log('public collections fetched:: ', this.publicCollections);
        });
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
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
      this.loadConversation();
    },
  },
  mounted() {
    olMap.setTarget('mapDiv');
    // this.$options.sockets.userJoinedChat = (data) => {
    //   console.log('user joined::', data);
    //   this.usersChatting.push(data);
    // };
    this.$options.sockets.newFeatureMessage = (data) => {
      // console.log('message received::', data);
      if (data.featureId === this.$store.state.feature.get('mongoID')) {
        this.newFeatureMessage(data);
      }
    };
    this.$options.sockets.newGeometry = (data) => {
      // console.log('message received::', data);
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

  .chat {
    font-size: 0.5em !important;
    overflow-y: auto;
    padding: 10px;
    margin: 2px;
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
    padding: 2px;
    margin: 2px;
  }

  .date {
    font-size: 0.55em !important;
  }
</style>
