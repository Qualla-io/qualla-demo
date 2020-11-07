import * as actionTypes from "../actions/actionTypes";
import {updateObject} from "../utils";

const initialState = {
  contractInstance: null,
  contract: {
    address: null,
    tiers: [],
  },
};

const updateSubscriber = (state, action) => {
  return updateObject(state, {
    [action.key]: action.value,
  });
};

const SubscriberReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_SUBSCRIBER:
      return updateSubscriber(state, action);
    default:
      return state;
  }
};

export default SubscriberReducer;
