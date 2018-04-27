<template>
  <v-container id='collectionList' v-show="privateCollectionsContainer">
  <v-container v-if="this.$store.state.isUserLoggedIn && openedCollection === null && openedPersonsTL === null">
    <v-layout row wrap>
      <v-flex md8>
        <v-text-field
          name="search-input"
          :label="$t('message.search')"
          :hint="$t('message.searchHint')"
          v-model="searchCollections"
          min="4"
          append-icon="search"
        ></v-text-field>
      </v-flex>
      <v-flex md4>
        <v-btn fab outline v-on:click='searchInCollections'>
          <v-icon color="green lighten-1">search</v-icon>
        </v-btn>
        <v-btn fab outline v-on:click="mode = 'normal'">
          <v-icon color="green lighten-1">clear</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
    <v-subheader inset v-if="this.$store.state.isUserLoggedIn && openedCollection === null && mode === 'normal'">
      <v-btn fab dark outline small color="green" @click="addPrivateCollectionCard">
        <v-icon dark>add</v-icon>
      </v-btn>
      <v-tooltip bottom>
        <span slot="activator">{{ $t("message.privateCollections") }}</span>
        <span>{{ $t('message.privateCollectionsHint')}}</span>
      </v-tooltip>
    </v-subheader>
    <v-container fluid v-if="this.$store.state.isUserLoggedIn && openedCollection === null && mode === 'normal'">
      <form v-if="newPrivateCollectionCard">
        <v-text-field
          v-model="newCollection.title"
          :label="$t('message.title')"
          :counter="32"
          data-vv-name="name"
          required
        ></v-text-field>
        <v-text-field
          v-model="newCollection.description"
          :label="$t('message.description')"
          :counter="32"
          data-vv-name="name"
          required
        ></v-text-field>
        <v-btn @click="createCollection">{{ $t('message.save') }}</v-btn>
        <v-btn @click="newPrivateCollectionCard = false">{{ $t('message.cancel') }}</v-btn>
      </form>
      <v-list
        v-if="$store.state.privateCollections"
        v-for="collection in $store.state.privateCollections"
        :key="collection._id"
      >
        <collection v-if="openedCollection === null || openedCollection === collection._id" :collection='collection'></collection>
      </v-list>
      <p v-if="privateCollections.length == 0 && $store.state.isUserLoggedIn">{{ $t('message.noPrivateCollections')}}
        <v-btn fab dark outline small color="green" @click="addPrivateCollectionCard">
          <v-icon dark>add</v-icon>
        </v-btn>
      </p>
    </v-container>

    <v-subheader inset v-if="this.$store.state.isUserLoggedIn && openedCollection === null && mode === 'normal'">
      <v-btn fab dark outline small color="green" @click="addPublicCollectionCard">
        <v-icon dark>add</v-icon>
      </v-btn>
      <v-tooltip bottom>
        <span slot="activator">{{ $t("message.publicCollections") }}</span>
        <span>{{ $t('message.publicCollectionsHint') }}</span>
      </v-tooltip>
    </v-subheader>
    <v-container fluid v-if="openedCollection === null && mode === 'normal'">
      <form v-if="newPublicCollectionCard">
        <v-text-field
          v-model="newCollection.title"
          :label="$t('message.title')"
          :counter="10"
          data-vv-name="name"
          required
        ></v-text-field>
        <v-text-field
          v-model="newCollection.description"
          :label="$t('message.description')"
          :counter="10"
          data-vv-name="name"
          required
        ></v-text-field>
        <v-btn @click="createCollection">{{ $t('message.save') }}</v-btn>
        <v-btn @click="newPublicCollectionCard = false">{{ $t('message.cancel') }}</v-btn>
      </form>
      <v-list
        v-for="collection in $store.state.publicCollections"
        :key="collection._id">
        <collection v-if="openedCollection === null || openedCollection === collection._id" :collection='collection'></collection>
      </v-list>
      <p v-if="publicCollections.length == 0 && $store.state.isUserLoggedIn">{{ $t('message.noPublicCollections')}}
        <v-btn fab dark outline small color="green" @click="addPublicCollectionCard">
          <v-icon dark>add</v-icon>
        </v-btn>
      </p>
    </v-container>


    <v-subheader inset v-if="this.$store.state.isUserLoggedIn && openedCollection === null && mode === 'search'">
      {{ $t('message.searchResults')}}
    </v-subheader>
    <v-container fluid v-if="openedCollection === null && mode === 'search'">
      <v-list
        v-for="collection in searchResultsCollections"
        :key="collection._id"
      >
        <collection v-if="openedCollection === null || openedCollection === collection._id" :collection='collection'></collection>
      </v-list>
      <p v-if="searchResultsCollections.length == 0 && $store.state.isUserLoggedIn">{{ $t('message.noResults')}}
      </p>
    </v-container>

    <!-- <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i> -->
    <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
    <v-snackbar
      :timeout=5000
      v-model="snackbar"
      color= snackbarColor
    >{{ message }}
    </v-snackbar>
    <collectionView v-if="openedCollection !== null" :id="openedCollection"></collectionView>
    <userTimeline v-if="openedPersonsTL !== null" :id="openedPersonsTL"></userTimeline>
    <v-btn block dark outline small color="green"
      @click="openedCollection = null; openedPersonsTL = null; mode = 'normal'"
      v-if="openedCollection !== null || openedPersonsTL !== null">
      <v-icon dark>undo</v-icon>
      {{ $t('message.back')}}
    </v-btn>

  </v-container>
</template>
<script>
import axios from 'axios';
import config from '../config';
import collection from './collection';
import collectionView from './collectionView';
import userTimeline from './userTimeline';

export default {
  name: 'collectionList',
  data() {
    return {
      loading: false,
      privateCollections: [
      ],
      publicCollections: [
      ],
      newPrivateCollectionCard: false,
      newPublicCollectionCard: false,
      privateCollectionsContainer: true,
      searchCollections: '',
      newCollection: {
        title: null,
        description: null,
        visibility: '',
        // username: this.$store.state.user.name,
      },
      message: '',
      snackbar: false,
      snackbarColor: 'green',
      openedCollection: null,
      openedPersonsTL: null,
      mode: 'normal',
      searchResultsCollections: [],
    };
    // eslint-disable-line no-underscore-dangle
  },
  components: {
    collection, collectionView, userTimeline,
  },
  methods: {
    getUserId() {
      let id;
      if (this.$store.state.user) { // eslint-disable-line no-underscore-dangle
        id = this.$store.state.user._id; // eslint-disable-line no-underscore-dangle
      } else {
        id = null;
      }
      return id;
    },
    addPrivateCollectionCard() {
      this.newPrivateCollectionCard = true;
      this.newCollection.visibility = 'private';
    },
    addPublicCollectionCard() {
      this.newPublicCollectionCard = true;
      this.newCollection.visibility = 'public';
    },
    createCollection() {
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections`;
      const newCollection = this.newCollection;
      newCollection.user = this.getUserId();
      newCollection.username = this.$store.state.user.name;
      // console.log('new collection:: ', newCollection.title, newCollection.description);
      axios.post(url, { newCollection },
        {
          headers: { 'x-access-token': this.$store.state.token },
        }).then(() => {
          this.message = this.$t('message.collectionAddedToast');
          this.snackbarColor = 'green';
          this.snackbar = true;
          if (this.newCollection.visibility === 'public') {
            this.loadPublicCollections();
            this.newPublicCollectionCard = false;
          } else {
            this.loadPrivateCollections();
            this.newPrivateCollectionCard = false;
          }
          this.newCollection.title = '';
          this.newCollection.description = '';
          this.newCollection.visibility = '';
        });
    },
    loadPrivateCollections() {
      // console.log('loading collections');
      this.loading = true;
      const vuexCollections = this.$store.state.privateCollections;
      if (vuexCollections && vuexCollections.length > 0) {
        this.privateCollections = this.$store.state.privateCollections;
      }
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections`;
      axios.get(url, {
        params: {
          userId: this.getUserId(),
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        this.privateCollections = response.data;
      }).then(() => {
        this.loading = false;
        this.$store.dispatch('setPrivateCollections', this.privateCollections);
      });
    },
    loadPublicCollections() {
      // console.log('loading collections');
      this.loading = true;
      const vuexCollections = this.$store.state.publicCollections;
      if (vuexCollections && vuexCollections.length > 0) {
        this.publicCollections = this.$store.state.publicCollections;
      }
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/public/collections`;
      axios.get(url, {
        params: {
          userId: this.getUserId(),
        },
      }).then((response) => {
        this.publicCollections = response.data;
        // console.log('public collections fetched:: ', this.publicCollections);
      }).then(() => {
        this.loading = false;
        this.$store.dispatch('setPublicCollections', this.publicCollections);
      });
    },
    getUsersList() {
      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/users/all`;
      axios.get(url, {
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        if (response.data.success === false) {
          // console.log(response.data);
          // console.log('not logged in to see others');
        } else {
          this.$store.dispatch('setUsers', response.data);
        }
      });
    },
    searchInCollections() {
      this.loading = true;
      this.mode = 'search';

      const url = `${config.APIhttpType}://${config.APIhost}:${config.APIhostPort}/${config.APIversion}/collections/search`;
      axios.get(url, {
        params: {
          userId: this.getUserId(),
          keyword: this.searchCollections,
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        this.searchResultsCollections = response.data;
        // console.log('public collections fetched:: ', this.publicCollections);
      }).then(() => {
        this.loading = false;
        // this.$store.dispatch('setPublicCollections', this.publicCollections);
      });
    },
  },
  mounted() {
    if (this.$route.params.id && this.$route.name === 'searchCollection') {
      console.log('loading collection from permalink', this.openedPersonsTL);
      this.openedPersonsTL = this.$route.params.id;
      this.mode = 'userTL';
    }
    if (this.$store.state.isUserLoggedIn) {
      this.loadPrivateCollections();
      this.loadPublicCollections();
    }
    this.$eventHub.$on('refreshprivatecollections', () => {
      console.log('refreshing private collections');
      this.loadPrivateCollections();
    });
    this.$eventHub.$on('refreshpubliccollections', () => {
      console.log('refreshing public collections');
      this.loadPublicCollections();
    });
    this.$eventHub.$on('logged-in', () => {
      this.loadPrivateCollections();
      this.loadPublicCollections();
    });
    this.$on('openedcollection', (id) => {
      // console.log('opened:: ', id);
      this.openedCollection = id;
    });
  },
};
</script>
<style>
#collectionList {
  color: black;
  max-height: 82vh;
  width: 100vh;
  overflow-y: scroll;
}
</style>
