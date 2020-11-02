import * as actionTypes from "./actionTypes";
import store from "../myStore";
import axios from "axios";

export const updateWeb3 = (key, value) => {
  return {
    type: actionTypes.UPDATE_WEB3,
    key: key,
    value: value,
  };
};

export const mintTokens = (account) => {
  return (dispatch) => {
    const web3State = store.getState().Web3Reducer;
    axios.post("http://localhost:8080/mint", {
      account: account,
      coin: web3State.Dai.address,
    });
  };
};
