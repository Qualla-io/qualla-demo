import * as actionTypes from "./actionTypes";

import store from "../myStore";
import axios from "axios";
import {ethers} from "ethers";
import SubscriptionContract from "../../contracts/SubscriptionV1.json";

export const updateCreator = (key, value) => {
  return {
    type: actionTypes.UPDATE_CREATOR,
    key: key,
    value: value,
  };
};

export const updateContract = () => {
  return (dispatch) => {
    var state = store.getState().Web3Reducer;
    const account = state.account;
    const signer = state.signer;
    axios
      .get(`http://localhost:8080/publishers/${account}/contract/`, {
        params: {publisher_address: account},
      })
      .then((res) => {
        if (res.data) {
          dispatch(updateCreator("contract", res.data));

          var Subscription = new ethers.Contract(
            res.data.address,
            SubscriptionContract.abi,
            signer
          );

          dispatch(updateCreator("contractInstance", Subscription));
        }
      });
  };
};
