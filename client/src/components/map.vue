<template>
  <div id='mw' class="mapStyle">
    <searchLocation></searchLocation>
    <div id='mapDiv' class="mapStyle"></div>
    <v-container xs3 md3 class="floating-bottom chat" v-if="currentlySelectedFeature !=='undefined' && currentlySelectedFeature !== null">
        <v-list class="message-list">
          <v-list-tile class="" v-for="message in currentMessages" v-bind:key="message">
            <v-list-tile-content class="">
              <!-- <v-list-tile-title v-text="currentlySelectedFeature.get('name')" class="caption"></v-list-tile-title> -->
              <v-list-tile-content v-text="message" class="caption"></v-list-tile-content>
            </v-list-tile-content>
            <!-- <v-list-tile-avatar>
              <img v-bind:src="item.avatar"/>
            </v-list-tile-avatar> -->
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
import olMap from '../js/map';
import searchLocation from './searchLocation';

export default {
  name: 'mw',
  data: () => ({
    new_message_label: 'Νέο Μήνυμα',
    send_label: 'Αποστολή',
    message_content: '',
    items: [],
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
          messages = null;
          messages = this.$store.state.feature.get('messages').split('\n');
        }
      } else {
        messages = null;
      }
      return messages;
    },
  },
  methods: {
    sendMessage() {
      if (this.content !== '') {
        this.$store.dispatch('sendMessage', {
          username: this.username,
          content: this.content,
          date: new Date().toString(),
          chatID: this.id });
        this.content = '';
      }
    },
  },
  mounted() {
    olMap.setTarget('mapDiv');
    console.log(this.$route.params.id);
  },
};
</script>
<style>
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
</style>
