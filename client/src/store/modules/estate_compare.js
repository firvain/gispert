import * as types from "../mutation-types";
/* eslint-disable */

// initial state
const state = {
  added: [],
  checkoutStatus: null,
};

// getters
const getters = {
  checkoutStatus: state => state.checkoutStatus,
};

// actions
const actions = {
  checkout({ commit, state }, products) {
    const savedCartItems = [...state.added];
    commit(types.CHECKOUT_REQUEST);
  },
};

// mutations
const mutations = {
  [types.ADD_TO_COMPARE](state, { id }) {
    state.lastCheckout = null;
    const exists = state.added.find(p => p === id);
    if (exists) {
      state.added.remove(id);
      // console.log('make button grey');
    } else {
      state.added.push(
        id,
      );
      // console.log('make button green');
    }
  },

  [types.CHECKOUT_REQUEST](state) {
    // clear cart
    state.added = [];
    state.checkoutStatus = null;
  },

  [types.CHECKOUT_SUCCESS](state) {
    state.checkoutStatus = 'successful';
  },

  [types.CHECKOUT_FAILURE](state, { savedCartItems }) {
    // rollback to the cart saved before sending the request
    state.added = savedCartItems;
    state.checkoutStatus = 'failed';
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
