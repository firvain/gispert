<template>
  <v-container id='collectionList' pa-0>
    <v-container id='list' v-if="this.$store.state.isUserLoggedIn && this.$store.state.openedTimeline === null">
      <v-container v-if="this.$store.state.isUserLoggedIn">
        <v-layout row wrap>
          <v-flex md8>
            <v-text-field
              name="search-input"
              :label="$t('message.search')"
              :hint="$t('message.searchHint')"
              v-model="searchCollections"
              min="4"
              append-icon="search"
              v-on:keyup.enter="searchInCollections"
            ></v-text-field>
          </v-flex>
          <v-flex md4>
            <v-btn fab small outline v-on:click='searchInCollections'>
              <v-icon color="green lighten-1">search</v-icon>
            </v-btn>
            <v-btn fab small outline v-on:click="mode = 'normal'">
              <v-icon color="green lighten-1">clear</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
      <v-subheader inset>
        <v-btn fab dark outline small color="green" @click="addPrivateCollectionCard">
          <v-icon dark>add</v-icon>
        </v-btn>
        <v-tooltip bottom>
          <span slot="activator">{{ $t("message.privateCollections") }}</span>
          <span>{{ $t('message.privateCollectionsHint')}}</span>
        </v-tooltip>
      </v-subheader>
      <v-container fluid>
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
          <collection :collection='collection'></collection>
        </v-list>
        <p v-if="$store.state.privateCollections.length == 0 && $store.state.isUserLoggedIn">{{ $t('message.noPrivateCollections')}}
          <v-btn fab dark outline small color="green" @click="addPrivateCollectionCard">
            <v-icon dark>add</v-icon>
          </v-btn>
        </p>
      </v-container>

      <v-subheader inset>
        <v-btn fab dark outline small color="green" @click="addPublicCollectionCard">
          <v-icon dark>add</v-icon>
        </v-btn>
        <v-tooltip bottom>
          <span slot="activator">{{ $t("message.publicCollections") }}</span>
          <span>{{ $t('message.publicCollectionsHint') }}</span>
        </v-tooltip>
      </v-subheader>
      <v-container fluid>
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
          <collection :collection='collection'></collection>
        </v-list>
        <p v-if="$store.state.publicCollections.length == 0 && $store.state.isUserLoggedIn">{{ $t('message.noPublicCollections')}}
          <v-btn fab dark outline small color="green" @click="addPublicCollectionCard">
            <v-icon dark>add</v-icon>
          </v-btn>
        </p>
      </v-container>
    </v-container>

    <v-subheader inset v-if="$store.state.isUserLoggedIn && $store.state.openedTimeline === null && mode === 'search'">
      {{ $t('message.searchResults')}}
    </v-subheader>
    <v-container fluid v-if="$store.state.openedTimeline === null && mode === 'search'">
      <v-list
        v-for="collection in searchResultsCollections"
        :key="collection._id"
      >
        <collection v-if="$store.state.openedTimeline === null || openedCollection === collection._id" :collection='collection'></collection>
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
    <collectionView
      v-if="$store.state.openedTimeline !== null && $store.state.openedTimeline.type === 'collection'" 
      :id="$store.state.openedTimeline.id">
    </collectionView>
    <userTimeline
      v-if="$store.state.openedTimeline !== null && $store.state.openedTimeline.type === 'timeline'"
      :id="$store.state.openedTimeline.id"
    ></userTimeline>
    <v-btn block dark outline small color="green"
      @click="closeCollectionView"
      v-if="$store.state.openedTimeline !== null">
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
      },
      message: '',
      snackbar: false,
      snackbarColor: 'green',
      openedCollection: null,
      openedPersonsTL: null,
      mode: 'normal',
      searchResultsCollections: [],
    };
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
      const url = `${config.url}/collections`;
      const newCollection = this.newCollection;
      newCollection.user = this.getUserId();
      newCollection.username = this.$store.state.user.name;
      // console.log('new collection:: ', newCollection.title, newCollection.description);
      axios.post(url, { newCollection },
        {
          headers: { 'x-access-token': this.$store.state.token },
        }).then((response) => {
          if (response.status === 200) {
            this.message = this.$t('message.collectionAddedToast');
            this.snackbarColor = 'green';
            this.snackbar = true;
            if (this.newCollection.visibility === 'public') {
              // this.loadPublicCollections();
              this.$store.dispatch('addPublicCollection', response.data);
              this.newPublicCollectionCard = false;
            } else {
              // this.loadPrivateCollections();
              this.$store.dispatch('addPrivateCollection', response.data);
              this.newPrivateCollectionCard = false;
            }
            this.newCollection.title = '';
            this.newCollection.description = '';
            this.newCollection.visibility = '';
          }
        });
    },
    loadPrivateCollections() {
      // console.log('loading collections');
      this.loading = true;
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
      const url = `${config.url}/public/collections`;
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
      const url = `${config.url}/users/all`;
      axios.get(url, {
        params: {
          userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        },
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
      console.log('started search');
      const url = `${config.url}/collections/search`;
      axios.get(url, {
        params: {
          userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
          keyword: this.searchCollections,
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        this.searchResultsCollections = response.data;
        console.log('public collections fetched:: ', this.publicCollections);
      }).then(() => {
        this.loading = false;
        // this.$store.dispatch('setPublicCollections', this.publicCollections);
      });
    },
    closeCollectionView() {
      this.$store.dispatch('setOpenedCustomTimeline', null);
      this.mode = 'normal';
      this.privateCollectionsContainer = true;
    },
  },
  mounted() {
    if (this.$route.params.id && this.$route.name === 'searchCollection') {
      this.openedPersonsTL = this.$route.params.id;
      console.log('loading collection from permalink, found this id:: ', this.openedPersonsTL);
      const tl = {
        id: this.$route.params.id,
        type: 'collection',
      };
      this.$store.dispatch('setOpenedCustomTimeline', tl);

      // this.$eventHub.$emit('openTimeline', this.openedPersonsTL);
      this.mode = 'userTL';
    }
    if (this.$route.params.id && this.$route.name === 'searchTimeline') {
      this.openedPersonsTL = this.$route.params.id;
      console.log('loading collection from permalink, found this id:: ', this.openedPersonsTL);
      const tl = {
        id: this.$route.params.id,
        type: 'timeline',
      };
      this.$store.dispatch('setOpenedCustomTimeline', tl);

      // this.$eventHub.$emit('openTimeline', this.openedPersonsTL);
      this.mode = 'userTL';
    }
    if (this.$store.state.isUserLoggedIn) {
      if (this.$store.state.publicCollections.length === 0) {
        this.loadPublicCollections();
      }
      if (this.$store.state.privateCollections.length === 0) {
        this.loadPrivateCollections();
      }
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
    // this.$on('openedcollection', (id) => {
    //   console.log('opened:: ', id);
    //   this.openedCollection = id;
    // });
    this.$eventHub.$on('openCollection', (id) => {
      console.log('open collection, notification clicked:: ', id);
      this.openedCollection = id;
      this.openedPersonsTL = null;
      this.mode = 'collectionView';
    });
    this.$eventHub.$on('openTimeline', (id) => {
      console.log('open timeline from notification:: ', id);
      this.openedPersonsTL = id;
      this.openedCollection = null;
      this.mode = 'userTL';
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
