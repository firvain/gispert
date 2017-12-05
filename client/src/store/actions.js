import * as types from './mutation-types';
/* eslint-disable */

export const addToSelected = ({ commit }, feature) => {
  console.log(feature);
  if (feature) {
    commit(types.ADD_TO_SELECTED, {
      feature: feature,
    });
  }
};
