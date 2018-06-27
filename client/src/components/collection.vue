<template>
    <v-card xs12 sm12>
      <v-card-title>
        <div>
          <h3 class="subheading ma-0 pa-0">
            {{ collection.title }} {{ $t('message.ofTheUser')}} {{collection.username}}
          </h3>
          {{ collection.description }}
          <v-btn v-if="collection.members" flat disabled small color="primary">{{ $t('message.membersNumber')}}: {{ collection.members.length }}</v-btn>
        </div>
      </v-card-title>
      <v-list-tile>
        <v-list-tile-action>
          <v-btn fab small outline @click="exploreCollection(collection._id)">
            <v-icon color="blue lighten-1" v-if="details">folder_open</v-icon>
            <v-icon color="blue lighten-1" v-if="details === false">folder</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action v-if="this.$store.state.isUserLoggedIn && collection.user !== this.$store.state.user._id">
          <v-btn fab small outline
            @click="unfollowCollectionDialog = true">
            <v-icon color="red lighten-1">visibility_off</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action v-if="this.$store.state.isUserLoggedIn && collection.user === this.$store.state.user._id">
          <v-btn fab small outline @click="deleteCollectionDialog = true">
            <v-icon color="red lighten-1">delete</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action v-if="this.$store.state.isUserLoggedIn && collection.user === this.$store.state.user._id">
          <v-btn fab small outline>
            <v-icon color="orange lighten-1">edit</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action v-if="this.$store.state.isUserLoggedIn && collection.user === this.$store.state.user._id">
          <v-btn fab small outline @click="shareDialog = true">
            <v-icon color="green lighten-1">share</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action v-if="collection.visibility === 'public'">
            <v-tooltip bottom>
              <v-btn outline fab small 
                slot="activator" 
                @click="shareLink = !shareLink; copyToClipboard();"
              >
                <v-icon color="green lighten-1">link</v-icon>
              </v-btn>
              <span>{{ $t("message.shareLink") }}!</span>
            </v-tooltip>
        </v-list-tile-action>
      </v-list-tile>

      <v-dialog v-model="shareDialog" persistent max-width="350">
        <v-card>
          <v-card-title class="headline">{{ $t('message.chooseUsersToShare')}}</v-card-title>
          <v-card-text>
            <v-flex xs12 sm12>
              <v-select v-if="this.$store.state.users"
                label="Επιλογή"
                v-bind:items="this.$store.state.users"
                v-model="members"
                item-text="name"
                item-value="_id"
                multiple
                chips
                max-height="300px"
                autocomplete
              >
              </v-select>
            </v-flex>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat @click.native="shareDialog = false">{{ $t('message.close')}}</v-btn>
            <v-btn color="green darken-1" flat @click.native="inviteMembersToCollection(collection._id)">{{ $t('message.save')}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="deleteCollectionDialog" persistent max-width="290">
        <v-card>
          <v-card-title class="headline">{{ $t('message.deleteCollection')}}</v-card-title>
          <v-card-text>{{ $t('message.allPostsWillBeDeleted')}}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat @click.native="deleteCollection(collection._id)">{{ $t('message.yes')}}</v-btn>
            <v-btn color="green darken-1" flat @click.native="deleteCollectionDialog = false">{{ $t('message.no')}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="unfollowCollectionDialog" persistent max-width="290">
        <v-card>
          <v-card-title class="headline">{{ $t('message.followCollection')}}</v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat @click.native="unfollowCollection(collection._id)">{{ $t('message.stopFollowing')}}</v-btn>
            <v-btn color="green darken-1" flat @click.native="unfollowCollectionDialog = false">{{ $t('message.cancel')}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="shareLink" persistent max-width="500px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ $t("message.shareLink") }}</span>
          </v-card-title>
          <v-card-text>
            <p>{{ $t("message.linkCopied") }}</p>
            <v-btn color="blue darken-1" flat @click.native="shareLink = false">{{ $t("message.close") }}</v-btn>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-card>
</template>
<script>
import axios from 'axios';
import clipboard from 'clipboard-copy';
import config from '../config';
import post from './post';
// import collectionView from './collectionView';

export default {
  props: ['collection'],
  name: 'collection',
  data: () => ({
    details: false,
    posts: null,
    loading: false,
    shareDialog: false,
    deleteCollectionDialog: false,
    unfollowCollectionDialog: false,
    members: [],
    shareLink: false,
  }),
  components: {
    post,
  },
  mounted() {
    // console.log('collection mounted');
    if (this.collection.members) {
      this.members = this.collection.members;
    }
    this.$options.sockets.refreshCollectionMembers = (data) => {
      console.log('refreshing members::', JSON.stringify(data));
      this.loadMembersOfThisCollection(data);
    };
  },
  computed: {
    collectionMembers() { // add members as function property
      const thisCollectionUsers = this.$store.state.users;
      // console.log(members);
      // members.forEach((c) => {
      //   thisCollectionUsers.remove(c);
      // });
      return thisCollectionUsers;
    },
    shareMapUrl() {
      const url = `${window.location.href}/collection/${this.collection._id}`; // eslint-disable-line no-underscore-dangle
      // console.log(this.customMap.id);
      return url;
    },
  },
  methods: {
    exploreCollection(collectionId) {
      // TODO make correct request
      if (this.details) {
        this.$eventHub.$emit('openCollection', null);
        // this.$parent.$parent.$emit('openedcollection', null);
        // console.log('collection is open');
      } else {
        const tl = {
          id: collectionId,
          type: 'collection',
        };
        this.$eventHub.$emit('openCollection', collectionId);
        this.$store.dispatch('setOpenedCustomTimeline', tl);
        // this.$parent.$parent.$emit('openedcollection', id);
        // console.log('collection closed');
      }
      this.details = !this.details;
    },
    deleteCollection(id) {
      this.deleteCollectionDialog = false;
      const url = `${config.url}/collections/delete`;
      // console.log('id to delete:: ', id);
      axios.post(url, { id }, {
        headers: { 'x-access-token': this.$store.state.token },
      }).then(() => {
        this.loading = false;
        if (this.collection.visibility === 'private') {
          this.$eventHub.$emit('refreshprivatecollections', 'refresh');
        }
        if (this.collection.visibility === 'public') {
          this.$store.dispatch('deletePrivateCollection', id);
          this.$store.dispatch('deletePublicCollection', id);
          this.$eventHub.$emit('refreshpubliccollections', 'refresh');
        }
      });
    },
    unfollowCollection(id) {
      this.unfollowCollectionDialog = false;
      const url = `${config.url}/collections/unfollow`;
      // console.log('id to delete:: ', id);
      const data = {
        memberId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        collectionId: id,
        userCreated: this.collection.user,
      };
      axios.post(url, { data }, {
        headers: { 'x-access-token': this.$store.state.token },
      }).then(() => {
        this.loading = false;
        if (this.collection.visibility === 'private') {
          this.$eventHub.$emit('refreshprivatecollections', 'refresh');
        }
        if (this.collection.visibility === 'public') {
          this.$store.dispatch('deletePrivateCollection', id);
          this.$store.dispatch('deletePublicCollection', id);
          this.$eventHub.$emit('refreshpubliccollections', 'refresh');
          this.$socket.emit('unfollowedCollection', data);
        }
      });
    },
    inviteMembersToCollection(id) {
      const url = `${config.url}/notifications/inviteMembers`;
      const ids = this.members;
      const data = {
        members: ids,
        collectionId: id,
        byUser: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
      };
      axios.post(url, { data }, {
        headers: { 'x-access-token': this.$store.state.token },
      }).then(() => {
        this.$socket.$emit('inviteToCollection', data.members);
      });
    },
    loadMembersOfThisCollection(id) {
      const url = `${config.url}/collections/members`;
      axios.get(url, {
        params: {
          collectionId: id,
          userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        },
        headers: { 'x-access-token': this.$store.state.token },
      }).then((response) => {
        this.members = response.data;
      }).then(() => {
        this.loading = false;
      });
    },
    copyToClipboard() {
      clipboard(this.shareMapUrl);
    },
  },
};
</script>
