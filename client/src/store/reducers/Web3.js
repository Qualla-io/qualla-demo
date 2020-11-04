import * as actionTypes from "../actions/actionTypes";
import {updateObject} from "../utils";

const initialState = {
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  Dai: null,
  Factory: null,
};

const updateWeb3 = (state, action) => {
  return updateObject(state, {
    [action.key]: action.value,
  });
};

const Web3Reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_WEB3:
      return updateWeb3(state, action);
    default:
      return state;
  }
};

export default Web3Reducer;
