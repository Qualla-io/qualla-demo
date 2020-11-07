import * as actionTypes from "../actions/actionTypes";
import {updateObject} from "../utils";

const initialState = {
  contractInstance: null,
  contract: {
    address: null,
    tiers: [
      {title: "Tier 1", value: "5", perks: "ad free"},
      {title: "Tier 2", value: "10", perks: "early access"},
    ],
  },
};

const updateCreator = (state, action) => {
  return updateObject(state, {
    [action.key]: action.value,
  });
};

const CreatorReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_CREATOR:
      return updateCreator(state, action);
    default:
      return state;
  }
};

export default CreatorReducer;
