<template>
  <v-card xs12 sm12>
    <v-card-title>
      <div>
        <h3 class="subheading ma-0 pa-0">
          {{ collection.title }} {{ $t("message.ofTheUser") }}
          {{ collection.username }}
        </h3>
        {{ collection.description }}
        <v-btn v-if="collection.members" text disabled small color="primary"
          >{{ $t("message.membersNumber") }}:
          {{ collection.members.length }}</v-btn
        >
      </div>
    </v-card-title>
    <v-card-actions class="grey lighten-3">
      <v-list-tile>
        <v-list-tile-action>
          <v-btn fab small outline @click="exploreCollection(collection)">
            <v-icon v-if="details" color="blue lighten-1">folder_open</v-icon>
            <v-icon v-if="details === false" color="blue lighten-1"
              >folder</v-icon
            >
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action
          v-if="
            this.$store.state.isUserLoggedIn &&
              collection.user !== this.$store.state.user._id &&
              collection.isMember === true
          "
        >
          <v-btn fab small outline @click="unfollowCollectionDialog = true">
            <v-icon color="red lighten-1">visibility_off</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action
          v-if="
            this.$store.state.isUserLoggedIn &&
              collection.user !== this.$store.state.user._id &&
              collection.isMember === false
          "
        >
          <v-btn fab small outline @click="followCollection()">
            <v-icon color="red lighten-1">visibility</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-action
          v-if="
            this.$store.state.isUserLoggedIn &&
              collection.user === this.$store.state.user._id
          "
        >
          <v-btn fab small outline @click="deleteCollectionDialog = true">
            <v-icon color="red lighten-1">delete</v-icon>
          </v-btn>
        </v-list-tile-action>
        <!-- <v-list-tile-action v-if="this.$store.state.isUserLoggedIn && collection.user === this.$store.state.user._id">
            <v-btn fab small outline>
              <v-icon color="orange lighten-1">edit</v-icon>
            </v-btn>
          </v-list-tile-action> -->
      </v-list-tile>
      <v-spacer></v-spacer>
      <v-menu bottom left>
        <v-btn slot="activator" icon fab outline small color="green">
          <v-icon color="green">more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile
            v-if="
              this.$store.state.isUserLoggedIn &&
                collection.user === this.$store.state.user._id
            "
            class="hover"
          >
            <v-list-tile-title>
              <span
                class="caption"
                @click="
                  shareDialog = true;
                  loadMembersOfThisCollection(collection._id);
                  loadEditorsOfThisCollection(collection._id);
                "
              >
                <v-icon color="green lighten-1">share</v-icon>
                {{ $t("message.sharingSettings") }}
              </span>
            </v-list-tile-title>
          </v-list-tile>

          <v-list-tile v-if="collection.visibility === 'public'" class="hover">
            <v-list-tile-title>
              <span
                class="caption"
                @click="
                  shareLink = !shareLink;
                  copyToClipboard();
                "
              >
                <v-icon>link</v-icon>
                {{ $t("message.shareLink") }}!
              </span>
            </v-list-tile-title>
          </v-list-tile>

          <v-list-tile
            v-if="
              $store.state.user._id === collection.user &&
                collection.visibility === 'private'
            "
            class="hover"
          >
            <v-list-tile-title>
              <span
                class="caption"
                @click="setCollectionPrivacy(collection._id)"
              >
                >
                <v-icon @click="setCollectionPrivacy(collection._id)"
                  >link</v-icon
                >
                {{ $t("message.makeCollectionPublic") }}
              </span>
            </v-list-tile-title>
          </v-list-tile>
          <v-list-tile
            v-if="
              $store.state.user._id === collection.user &&
                collection.visibility === 'public'
            "
            class="hover"
          >
            <v-list-tile-title>
              <span
                class="caption"
                @click="setCollectionPrivacy(collection._id)"
              >
                >
                <v-icon @click="setCollectionPrivacy(collection._id)"
                  >link</v-icon
                >
                {{ $t("message.makeCollectionPrivate") }}
              </span>
            </v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-card-actions>

    <v-dialog v-model="shareDialog" persistent max-width="480" height="120">
      <v-card>
        <v-card-title class="headline">{{
          $t("message.chooseUsersToShare")
        }}</v-card-title>
        <v-card-text>
          Current members:
          <div style="overflow-y: scroll; max-height: 150px">
            <v-progress-linear
              v-show="loading"
              :indeterminate="true"
            ></v-progress-linear>
            <v-list>
              <v-list-tile v-for="user in members" :key="user._id" avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-text="user.name"></v-list-tile-title>
                </v-list-tile-content>
                <!-- <v-list-tile-avatar>
                    <img src="../../dist/logo.png"/>
                  </v-list-tile-avatar> -->
                <v-list-tile-action>
                  <v-layout row wrap>
                    <v-btn
                      icon
                      outline
                      color="red lighten-1"
                      @click.native="removeUserFromCollection(user._id)"
                    >
                      <v-icon dark>delete</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                      v-if="!editors.includes(user._id)"
                      icon
                      outline
                      color="orange lighten-1"
                      @click.native="makeEditor(user._id, collection._id)"
                    >
                      >
                      <v-icon dark>edit</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="editors.includes(user._id)"
                      icon
                      outline
                      color="green lighten-1"
                      @click.native="removeEditor(user._id, collection._id)"
                    >
                      >
                      <v-icon dark>edit</v-icon>
                    </v-btn>
                  </v-layout>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click.native="shareDialog = false"
            >{{ $t("message.close") }}</v-btn
          >
          <v-btn
            color="green darken-1"
            text
            @click.native="
              shareDialogAddMembers = true;
              shareDialog = false;
            "
            >Προσθήκη μελών</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="shareDialogAddMembers"
      persistent
      max-width="480"
      height="120"
    >
      <v-card>
        <v-card-title class="headline">{{
          $t("message.chooseUsersToShare")
        }}</v-card-title>
        <v-card-text>
          <v-layout>
            <v-flex md10>
              <v-text-field
                id="testing"
                v-model="userSearchTerm"
                name="input-1"
                label="Search user name"
                autofocus
                @keyup.enter="searchUsers"
              ></v-text-field>
            </v-flex>
            <v-flex md2>
              <v-progress-circular
                v-show="loading"
                indeterminate
                color="primary"
                :size="40"
              ></v-progress-circular>
            </v-flex>
          </v-layout>
          <div style="overflow-y: scroll; max-height: 150px">
            <v-list v-if="searchResultUsers !== null">
              <v-list-tile
                v-for="user in searchResultUsers"
                :key="user._id"
                avatar
              >
                <v-list-tile-content>
                  <v-list-tile-title v-text="user.name"></v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-btn icon @click="addUserToInvitations(user._id)">
                    <v-icon
                      v-if="!usersToInvite.includes(user._id)"
                      color="green"
                      dark
                      >add</v-icon
                    >
                    <v-icon
                      v-if="usersToInvite.includes(user._id)"
                      color="green"
                      dark
                      >check_circle_outline</v-icon
                    >
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
            <v-list v-if="searchResultUsers === null">
              <v-list-tile v-for="user in membersToAdd" :key="user._id" avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-text="user.name"></v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-btn icon @click="addUserToInvitations(user._id)">
                    <v-icon
                      v-if="!usersToInvite.includes(user._id)"
                      color="green"
                      dark
                      >add</v-icon
                    >
                    <v-icon
                      v-if="usersToInvite.includes(user._id)"
                      color="green"
                      dark
                      >check_circle_outline</v-icon
                    >
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click.native="
              shareDialogAddMembers = false;
              shareDialog = true;
              usersToInvite = [];
            "
            >{{ $t("message.close") }}</v-btn
          >
          <v-btn
            color="green darken-1"
            text
            @click.native="inviteMembersToCollection(collection._id)"
          >
            {{ $t("message.sendMessage") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteCollectionDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">{{
          $t("message.deleteCollection")
        }}</v-card-title>
        <v-card-text>{{ $t("message.allPostsWillBeDeleted") }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click.native="deleteCollection(collection._id)"
            >{{ $t("message.yes") }}</v-btn
          >
          <v-btn
            color="green darken-1"
            text
            @click.native="deleteCollectionDialog = false"
            >{{ $t("message.no") }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="unfollowCollectionDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">{{
          $t("message.followCollection")
        }}</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click.native="unfollowCollection(collection._id)"
            >{{ $t("message.stopFollowing") }}</v-btn
          >
          <v-btn
            color="green darken-1"
            text
            @click.native="unfollowCollectionDialog = false"
            >{{ $t("message.cancel") }}</v-btn
          >
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
          <v-btn color="blue darken-1" text @click.native="shareLink = false">{{
            $t("message.close")
          }}</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import axios from "axios";
import clipboard from "clipboard-copy";
import config from "../config";
import post from "./post";
// import collectionView from './collectionView';

export default {
  name: "Collection",
  components: {
    post
  },
  props: ["collection"],
  data: () => ({
    details: false,
    posts: null,
    loading: false,
    shareDialog: false,
    deleteCollectionDialog: false,
    unfollowCollectionDialog: false,
    members: [],
    editors: [],
    shareLink: false,
    isEditor: true,
    shareDialogAddMembers: false,
    userSearchTerm: "",
    searchResultUsers: null,
    usersToInvite: []
  }),
  computed: {
    membersToAdd() {
      // eslint-disable-next-line
      return this.$store.state.users.filter(function(obj) {
        // eslint-disable-next-line
          return !this.has(obj._id);
        // eslint-disable-next-line
      }, new Set(this.members.map(obj => obj._id)));
    },
    shareMapUrl() {
      const url = `${config.share}/collection/${this.collection._id}`; // eslint-disable-line no-underscore-dangle
      // console.log(this.customMap.id);
      return url;
    }
  },
  watch: {
    userSearchTerm: function handle() {
      this.searchUsers();
    }
  },
  mounted() {
    // this.$options.sockets.refreshCollectionMembers = (data) => {
    //   console.log('refreshing members::', JSON.stringify(data));
    //   this.loadMembersOfThisCollection(data);
    // };
    this.$options.sockets.unfollowedCollection = data => {
      console.log("unfollowedCollection", data);
      this.loadMembersOfThisCollection(data.collectionId);
    };
    this.$options.sockets.followedCollection = data => {
      console.log("followedCollection", data);
      this.loadMembersOfThisCollection(data.collectionId);
    };
  },
  methods: {
    removeUserFromCollection(id) {
      this.members = this.members.filter(e => e._id !== id); // eslint-disable-line no-underscore-dangle
      this.loading = true;
      const url = `${config.url}/collections/unfollow`;
      const data = {
        memberId: id,
        collectionId: this.collection._id, // eslint-disable-line no-underscore-dangle
        userCreated: this.collection.user,
        force: true
      };
      // this.$socket.emit('removeUserFromCollection', data);
      axios
        .post(
          url,
          { data },
          {
            headers: { "x-access-token": this.$store.state.token }
          }
        )
        .then(() => {
          this.members.remove(id);
          this.loading = false;
          this.$socket.emit("removeUserFromCollection", data);
        });
    },
    addUserToInvitations(id) {
      console.log("handling this user id::", id);
      if (!this.usersToInvite.includes(id)) {
        this.usersToInvite.push(id);
      } else {
        this.usersToInvite.remove(id);
      }
    },
    exploreCollection(collection) {
      if (this.details) {
        this.$eventHub.$emit("openCollection", null);
        // this.$parent.$parent.$emit('openedcollection', null);
        // console.log('collection is open');
      } else {
        const tl = {
          id: collection._id, // eslint-disable-line no-underscore-dangle
          type: "collection",
          title: collection.title,
          visibility: collection.visibility,
          userCreated: collection.user,
          isEditor: collection.isEditor
        };
        this.$eventHub.$emit("openCollection", tl); // eslint-disable-line no-underscore-dangle
        this.$store.dispatch("setOpenedCustomTimeline", tl);
        // this.$parent.$parent.$emit('openedcollection', id);
        // console.log('collection closed');
      }
      this.details = !this.details;
    },
    deleteCollection(id) {
      this.deleteCollectionDialog = false;
      const url = `${config.url}/collections/delete`;
      // console.log('id to delete:: ', id);
      axios
        .post(
          url,
          { id },
          {
            headers: { "x-access-token": this.$store.state.token }
          }
        )
        .then(() => {
          this.loading = false;
          // if (this.collection.visibility === 'private') {
          //   this.$eventHub.$emit('refreshprivatecollections', 'refresh');
          // }
          // if (this.collection.visibility === 'public') {
          this.$store.dispatch("deletePrivateCollection", id);
          this.$store.dispatch("deletePublicCollection", id);
          // this.$eventHub.$emit('refreshpubliccollections', 'refresh');
          // }
        });
    },
    unfollowCollection(id) {
      this.unfollowCollectionDialog = false;
      const url = `${config.url}/collections/unfollow`;
      // console.log('id to delete:: ', id);
      const data = {
        memberId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        collectionId: id,
        userCreated: this.collection.user
      };
      axios
        .post(
          url,
          { data },
          {
            headers: { "x-access-token": this.$store.state.token }
          }
        )
        .then(() => {
          this.loading = false;
          if (this.collection.visibility === "private") {
            this.$eventHub.$emit("refreshprivatecollections", "refresh");
            this.$store.commit("removeCollectionFromTimeline", id);
          }
          if (this.collection.visibility === "public") {
            this.$store.dispatch("deletePrivateCollection", id);
            this.$store.dispatch("deletePublicCollection", id);
            this.$store.commit("removeCollectionFromTimeline", id);
            this.$eventHub.$emit("refreshpubliccollections", "refresh");
            this.$socket.emit("unfollowedCollection", data);
          }
        });
    },
    inviteMembersToCollection(id) {
      this.shareDialogAddMembers = false;
      this.shareDialog = true;
      const url = `${config.url}/notifications/inviteMembers`;
      const ids = this.usersToInvite;
      const data = {
        members: ids,
        collectionId: id,
        byUser: this.$store.state.user._id // eslint-disable-line no-underscore-dangle
      };
      axios
        .post(
          url,
          { data },
          {
            headers: { "x-access-token": this.$store.state.token }
          }
        )
        .then(response => {
          if (response.status === 200) {
            console.log("emitting invitation to members::", data);
            this.$socket.emit("inviteToCollection", ids);
          }
        });
    },
    loadMembersOfThisCollection(id) {
      const url = `${config.url}/collections/members`;
      axios
        .get(url, {
          params: {
            collectionId: id,
            userId: this.$store.state.user._id // eslint-disable-line no-underscore-dangle
          },
          headers: { "x-access-token": this.$store.state.token }
        })
        .then(response => {
          this.members = response.data[0].users;
        })
        .then(() => {
          this.loading = false;
        });
    },
    loadEditorsOfThisCollection(id) {
      const url = `${config.url}/collections/editors`;
      axios
        .get(url, {
          params: {
            collectionId: id,
            userId: this.$store.state.user._id // eslint-disable-line no-underscore-dangle
          },
          headers: { "x-access-token": this.$store.state.token }
        })
        .then(response => {
          response.data[0].users.forEach(u => {
            this.editors.push(u._id); // eslint-disable-line no-underscore-dangle
          });
          // this.editors = response.data[0].users;
        })
        .then(() => {
          console.log("loading editors:: ", JSON.stringify(this.editors));
          this.loading = false;
        });
    },
    copyToClipboard() {
      clipboard(this.shareMapUrl);
    },
    searchUsers() {
      if (this.$store.state.isUserLoggedIn && this.userSearchTerm.length > 0) {
        this.loading = true;
        const url = `${config.url}/users/search`;
        axios
          .get(url, {
            params: {
              userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
              keyword: this.userSearchTerm
            },
            headers: { "x-access-token": this.$store.state.token }
          })
          .then(response => {
            if (response.data) {
              this.searchResultUsers = response.data;
              // this.users = response.data;
            }
          })
          .then(() => {
            this.loading = false;
          });
      }
      if (
        this.$store.state.isUserLoggedIn &&
        this.userSearchTerm.length === 0
      ) {
        this.searchResultUsers = this.$store.state.users;
      }
    },
    makeEditor(userId, collectionId) {
      const url = `${config.url}/collections/setEditor`;
      const data = {
        collectionId,
        userId
      };
      axios
        .post(
          url,
          { data },
          {
            headers: { "x-access-token": this.$store.state.token }
          }
        )
        .then(response => {
          if (response.status === 200) {
            this.editors.push(userId);
            this.$socket.emit("youAreEditor", data);
          }
        });
    },
    removeEditor(userId, collectionId) {
      const url = `${config.url}/collections/removeEditor`;
      const data = {
        collectionId,
        userId
      };
      axios
        .post(
          url,
          { data },
          {
            headers: { "x-access-token": this.$store.state.token }
          }
        )
        .then(response => {
          if (response.status === 200) {
            this.editors.remove(userId);
            this.$socket.emit("youAreNotEditor", data);
          }
        });
    },
    followCollection() {
      const url = `${config.url}/collections/setMembership`;
      const data = {
        memberId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        collectionsToFollow: [this.collection._id], // eslint-disable-line no-underscore-dangle
        collectionsToUnfollow: [],
        userCreated: this.collection.user
      };
      console.log("follow:: ", data);
      axios
        .post(
          url,
          { data },
          {
            headers: { "x-access-token": this.$store.state.token }
          }
        )
        .then(() => {
          this.collection.isMember = true;
          this.$socket.emit("followedCollection", data);
          this.$eventHub.$emit("refreshprivatecollections");
          this.$eventHub.$emit("refreshpubliccollections");
          // console.log('mark as followed and notify user');
        });
    },
    setCollectionPrivacy(collectionId) {
      const url = `${config.url}/collections/setPrivacy`;
      let setting;
      if (this.collection.visibility === "public") {
        setting = "private";
      } else {
        setting = "public";
      }
      console.log("setting privacy:: ", setting);
      const data = {
        userId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        userCreated: this.collection.user,
        collectionId,
        setting
      };
      axios
        .post(
          url,
          { data },
          {
            headers: { "x-access-token": this.$store.state.token }
          }
        )
        .then(() => {
          this.$eventHub.$emit("refreshprivatecollections");
          this.$eventHub.$emit("refreshpubliccollections");
          // console.log('mark as followed and notify user');
        });
    }
  }
};
</script>
<style scoped>
.userList {
  max-height: 100px;
  overflow: hidden;
}
</style>
