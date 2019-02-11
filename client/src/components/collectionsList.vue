<template>
  <v-container id='collectionList' pa-0>
    <v-container id='list' v-if="this.$store.state.isUserLoggedIn && this.$store.state.openedTimeline === null">
      <v-layout row wrap>
        <v-layout row wrap>
          <v-flex md10>
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
          <v-flex md2>
            <v-btn fab small outline v-on:click="mode = 'normal'">
              <v-icon color="green lighten-1">clear</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
        <v-flex>
          <v-subheader inset v-if="$store.state.isUserLoggedIn && $store.state.openedTimeline === null && mode === 'search'">
            {{ $t('message.searchResults') }}
          </v-subheader>
          <v-container fluid v-if="$store.state.openedTimeline === null && mode === 'search'">
            <v-list
              v-for="collection in searchResultsCollections"
              :key="collection._id"
            >
              <collection v-if="$store.state.openedTimeline === null || openedCollection === collection._id" :collection='collection'></collection>
            </v-list>
            <v-list
              v-for="thread in postsQueryResult"
              :key="thread._id"
            >
              <thread v-if="$store.state.openedTimeline === null || openedCollection === collection._id" :thread='thread'></thread>
            </v-list>
            <p v-if="searchResultsCollections.length === 0 && postsQueryResult.length === 0">{{ $t('message.noResults')}}
            </p>
          </v-container>
        </v-flex>
      </v-layout>
      <v-subheader inset v-if="mode === 'normal'">
        <v-btn fab dark outline small color="green" @click="addPrivateCollectionCard">
          <v-icon dark>add</v-icon>
        </v-btn>
        <v-tooltip bottom>
          <span class = 'title' slot="activator">{{ $t("message.privateCollections") }}</span>
          <span>{{ $t('message.privateCollectionsHint')}}</span>
        </v-tooltip>
      </v-subheader>
      <v-container fluid v-if="mode === 'normal'">
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
        <v-progress-linear v-show="loadingPrivate" :indeterminate="true"></v-progress-linear>
      </v-container>

      <v-subheader inset v-if="mode === 'normal'">
        <v-btn fab dark outline small color="green" @click="addPublicCollectionCard">
          <v-icon dark>add</v-icon>
        </v-btn>
        <v-tooltip bottom>
          <span class = 'title' slot="activator">{{ $t("message.publicCollections") }}</span>
          <span>{{ $t('message.publicCollectionsHint') }}</span>
        </v-tooltip>
      </v-subheader>
      <v-container fluid v-if="mode === 'normal'">
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
        <v-progress-linear v-show="loadingPublic" :indeterminate="true"></v-progress-linear>
      </v-container>
    </v-container>

    <!-- <i v-show="loading" class="fa fa-spinner fa-spin fa-3x"></i> -->
    <v-progress-linear v-show="loading" :indeterminate="true"></v-progress-linear>
    <v-snackbar
      :timeout=5000
      v-model="snackbar"
      color= snackbarColor
    >{{ message }}
    </v-snackbar>
    <v-btn block dark outline small color="green"
      @click="closeCollectionView"
      v-if="$store.state.openedTimeline !== null && loading === false">
      <v-icon dark>undo</v-icon>
      {{ $t('message.back')}}
    </v-btn>
    <collectionView
      v-if="$store.state.openedTimeline !== null && $store.state.openedTimeline.type === 'collection'"
      :collection="$store.state.openedTimeline">
    </collectionView>
    <userTimeline
      v-if="$store.state.openedTimeline !== null && $store.state.openedTimeline.type === 'timeline'"
      :id="$store.state.openedTimeline.id"
    ></userTimeline>
    <v-container>
      <thread
        :thread='openThread[0]'
        v-if="$store.state.openedTimeline !== null && $store.state.openedTimeline.type === 'thread' && openThread">
      </thread>
    </v-container>
    <!-- <post :post='postContent' v-if="postContent !== null"></post> -->
    <v-btn block dark outline small color="green"
      @click="closeCollectionView"
      v-if="$store.state.openedTimeline !== null && loading === false">
      <v-icon dark>undo</v-icon>
      {{ $t('message.back')}}
    </v-btn>

  </v-container>
</template>
<script>
import axios from 'axios';
import post from '@/components/post';
import collection from '@/components/collection';
import collectionView from '@/components/collectionView';
import userTimeline from '@/components/userTimeline';
import thread from '@/components/thread';
import config from '../config';

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
      postContent: null,
      openThread: null,
      postsQueryResult: null,
    };
  },
  components: {
    collection, collectionView, userTimeline, post, thread,
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
              const addedCollection = response.data;
              addedCollection.isEditor = true;
              this.$store.dispatch('addPublicCollection', addedCollection);
              this.newPublicCollectionCard = false;
            } else {
              // this.loadPrivateCollections();
              const addedCollection = response.data;
              addedCollection.isEditor = true;
              this.$store.dispatch('addPrivateCollection', addedCollection);
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
      this.loadingPrivate = true;
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
        this.loadingPrivate = false;
        this.privateCollections = response.data;
      }).then(() => {
        this.loadingPrivate = false;
        this.$store.dispatch('setPrivateCollections', this.privateCollections);
      });
    },
    loadPublicCollections() {
      // console.log('loading collections');
      this.loadingPublic = true;
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
        this.loadingPublic = false;
        this.publicCollections = response.data;
        console.log('public collections fetched:: ', this.publicCollections);
      }).then(() => {
        this.loadingPublic = false;
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
      const purl = `${config.url}/posts/search`;
      axios.get(purl, {
        params: {
          userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
          keyword: this.searchCollections,
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        this.postsQueryResult = response.data;
        console.log('posts found:: ', this.postsQueryResult);
      }).then(() => {
        this.loading = false;
        // this.$store.dispatch('setPublicCollections', this.publicCollections);
      });
    },
    loadPostFromPermalink(id) {
      this.postContent = null;
      let pUrl;
      let userIdCurrent;
      let token;
      let postContentNew;
      // console.log(id);
      if (this.$store.state.isUserLoggedIn) {
        pUrl = `${config.url}/posts/id`;
        userIdCurrent = this.$store.state.user._id; // eslint-disable-line no-underscore-dangle
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
            this.openThread = resp.data;
            // console.log('postContent:: ', this.postContent, this.postContent.text);
            this.postOpen = true;
            // console.log('postContent:: ', this.postOpen);
            postContentNew = this.postContent;
          }
        }).then(() => {
          this.postContent = postContentNew;
          const tl = {
            id,
            type: 'thread',
          };
          this.$store.dispatch('setOpenedCustomTimeline', tl);
          this.mode = 'thread';
          this.loading = false;
          this.loading = false;
          // console.log('postContent:: ', this.postContent, this.postContent.text);
        });
      }
    },
    loadPostFromFeature(mongoId) {
      this.loading = true;
      if (mongoId) {
        // console.log('before axios');
        axios.get(`${config.url}/posts/feature`, {
          params: {
            mongoId: mongoId,
            userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
          },
          headers: { 'x-access-token': this.$store.state.token },
        }).then((resp) => {
          if (resp.data) {
            // console.log(resp);
            this.openThread = resp.data;
            console.log('openThread:: ', this.openThread, resp.data);
            // this.postOpen = true;
            // console.log('postContent:: ', this.postOpen);
            // postContentNew = this.postContent;
          }
        }).then(() => {
          // this.postContent = postContentNew;
          const tl = {
            id: mongoId,
            type: 'thread',
          };
          this.$store.dispatch('setOpenedCustomTimeline', tl);
          this.mode = 'thread';
          this.loading = false;
          // console.log('postContent:: ', this.postContent, this.postContent.text);
        });
      }
    },
    closeCollectionView() {
      this.$store.dispatch('setOpenedCustomTimeline', null);
      this.$router.push('/');
      this.mode = 'normal';
      this.postContent = null;
      this.privateCollectionsContainer = true;
    },
  },
  mounted() {
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
      this.mode = 'normal';
    });
    // this.$on('openedcollection', (id) => {
    //   console.log('opened:: ', id);
    //   this.openedCollection = id;
    // });
    this.$eventHub.$on('openCollection', (id) => {
      console.log('open collection, notification clicked:: ', id);
      this.mode = 'collectionView';
    });
    this.$eventHub.$on('openTimeline', (id) => {
      console.log('open timeline from notification:: ', id);
      const tl = {
        id: this.$route.params.id,
        type: 'timeline',
      };
      this.$store.dispatch('setOpenedCustomTimeline', tl);
      this.mode = 'userTL';
    });
    this.$eventHub.$on('openPost', (id) => {
      this.loadPostFromPermalink(id);
      const tl = {
        id: this.$route.params.id,
        type: 'post',
      };
      this.$store.dispatch('setOpenedCustomTimeline', tl);
      this.mode = 'post';
    });
    this.$eventHub.$on('openPostFromNotification', (id) => {
      this.loadPostFromPermalink(id);
      const tl = {
        id: id,
        type: 'post',
      };
      this.$store.dispatch('setOpenedCustomTimeline', tl);
      this.mode = 'post';
    });
    this.$eventHub.$on('openFeaturePosts', (id) => {
      this.loadPostFromFeature(id);
    });
    this.$options.sockets.removeUserFromCollection = (data) => {
      console.log('removed from collection', data);
      this.$store.dispatch('deletePublicCollection', data.collectionId);
      this.$store.dispatch('deletePrivateCollection', data.collectionId);
    };
    this.$options.sockets.youAreEditor = (data) => {
      console.log('I am added as editor', data);
      this.$store.dispatch('addEditor', data);
    };
    this.$options.sockets.youAreNotEditor = (data) => {
      console.log('I am removed as editor', data);
      this.$store.dispatch('removeEditor', data);
    };
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
