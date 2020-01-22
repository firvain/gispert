<template>
  <v-layout>
    <v-flex xs12 sm12>
      <v-card>
        <v-card-title primary-title height="100px">
          <a v-if="user.name" md12 @click="explore">@{{ user.name }}</a>
        </v-card-title>
        <v-card-text v-if="user.description">
          {{ user.description }}
        </v-card-text>
        <v-card-actions class="grey lighten-3">
          <!-- <v-switch
            slot="activator"
            :label="$t('message.liveMapUpdate')"
            v-model="user.showLive"
            color="success"
          ></v-switch> -->
          <v-btn
            color="primary"
            dark
            fab
            outline
            small
            @click="
              dialogCollections = true;
              getCollections(user._id);
            "
          >
            <v-icon color="green lighten-1">list</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
    <v-dialog v-model="dialogCollections" scrollable max-width="300px">
      <v-card>
        <v-card-title>{{
          $t("message.chooseCollectionsToFollow")
        }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text style="height: 300px; color: black;">
          <v-progress-linear
            v-show="loading"
            :indeterminate="true"
          ></v-progress-linear>
          <v-checkbox
            v-for="collection in userCollections"
            :key="collection._id"
            v-model="selectedCollections"
            :label="collection.title"
            :value="collection._id"
            @click.native="
              listChanged = true;
              updateArrays(collection._id);
            "
          >
          </v-checkbox>
          <p v-show="noUserCollections">
            {{ $t("message.noUserCollectionsFound") }}
          </p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn
            v-if="listChanged"
            outline
            small
            @click="
              setMembershipToCollections();
              dialogCollections = false;
            "
          >
            {{ $t("message.save") }}
            <v-icon color="green lighten-1">save</v-icon>
          </v-btn>
          <v-btn
            outline
            small
            @click="
              dialogCollections = false;
              selectedCollections = [];
            "
          >
            {{ $t("message.close") }}
            <v-icon color="green lighten-1">close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import axios from "axios";
import config from "../config";

export default {
  name: "User",
  props: ["user"],
  data: () => ({
    userCollections: [],
    selectedCollections: [],
    unfollowThese: [],
    followThese: [],
    listChanged: false,
    dialogCollections: false,
    loading: false,
    initialCollections: [],
    noUserCollections: false
  }),
  watch: {
    // 'user.showLive': function toggle() {
    //   console.log('show live changed');
    //   if (this.user.showLive) {
    //     const url = `${config.url}/users/LiveMapChatForUser`;
    //     const data = {
    //       id: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
    //       liveId: this.user._id, // eslint-disable-line no-underscore-dangle
    //     };
    //     axios.post(url, { data }, {
    //       headers: { 'x-access-token': this.$store.state.token },
    //     })
    //     .then((res) => {
    //       if (res.status === 200) {
    //         this.$socket.emit('joinCollections', [this.user._id]);
    // eslint-disable-line no-underscore-dangle
    //         console.log('live user added');
    //       }
    //     });
    //   } else {
    //     const url = `${config.url}/users/removeLiveMapChatForUser`;
    //     const data = {
    //       id: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
    //       liveId: this.user._id, // eslint-disable-line no-underscore-dangle
    //     };
    //     axios.post(url, { data }, {
    //       headers: { 'x-access-token': this.$store.state.token },
    //     })
    //     .then((res) => {
    //       if (res.status === 200) {
    //         this.$socket.emit('leaveCollections', [this.user._id]);
    // eslint-disable-line no-underscore-dangle
    //         console.log('live user removed');
    //       }
    //     });
    //   }
    // },
  },
  mounted() {
    this.userCollections = this.user.collectionData;
  },
  methods: {
    explore() {
      this.$emit("explore", this.user);
    },
    updateArrays() {
      this.unfollowThese = [];
      this.followThese = [];
      this.initialCollections.forEach(c => {
        if (!this.selectedCollections.includes(c)) {
          this.unfollowThese.push(c);
        }
      });
      this.selectedCollections.forEach(c => {
        if (!this.initialCollections.includes(c)) {
          this.followThese.push(c);
        }
      });
    },
    setMembershipToCollections() {
      const url = `${config.url}/collections/setMembership`;
      const data = {
        memberId: this.$store.state.user._id, // eslint-disable-line no-underscore-dangle
        collectionsToFollow: this.followThese,
        collectionsToUnfollow: this.unfollowThese,
        userCreated: this.user._id // eslint-disable-line no-underscore-dangle
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
          this.listChanged = false;
          data.collectionsToFollow.forEach(cId => {
            const signal = { collectionId: cId };
            this.$socket.emit("followedCollection", signal);
          });
          data.collectionsToUnfollow.forEach(cId => {
            const signal = { collectionId: cId };
            this.$socket.emit("unfollowedCollection", signal);
          });
          this.$eventHub.$emit("refreshprivatecollections");
          this.$eventHub.$emit("refreshpubliccollections");
          // console.log('mark as followed and notify user');
        });
    },
    getCollections(id) {
      this.loading = true;
      const url = `${config.url}/users/collectionsOfUser`;
      axios
        .get(url, {
          params: {
            userId: id,
            memberId: this.$store.state.user._id // eslint-disable-line no-underscore-dangle
          },
          headers: { "x-access-token": this.$store.state.token }
        })
        .then(response => {
          if (response.data.length > 0) {
            this.userCollections = response.data;
            this.noUserCollections = false;
          } else {
            this.loading = false;
            this.noUserCollections = true;
          }
        })
        .then(() => {
          const idsOfCollections = [];
          this.$store.state.publicCollections.forEach(c => {
            idsOfCollections.push(c._id); // eslint-disable-line no-underscore-dangle
          });
          this.$store.state.privateCollections.forEach(c => {
            idsOfCollections.push(c._id); // eslint-disable-line no-underscore-dangle
          });
          return idsOfCollections;
        })
        .then(idsOfCollections => {
          this.userCollections.forEach(collection => {
            const checkId = collection._id; // eslint-disable-line no-underscore-dangle
            if (idsOfCollections.includes(checkId)) {
              this.selectedCollections.push(checkId);
              this.initialCollections.push(checkId);
            }
          });
          this.loading = false;
        });
    }
  }
};
</script>
<style>
a:hover {
  cursor: pointer;
}
</style>
