import store from "./myStore";
import axios from "axios";

import {ethers} from "ethers";

import SubscriptionContract from "../contracts/SubscriptionV1.json";
import * as creatorActions from "./actions/CreatorActions";

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

export const updateContract = () => {
  return (dispatch) => {
    const web3State = store.getState().Web3Reducer;
    const account = web3State.account;
    const signer = web3State.signer;
    axios
      .get(`http://localhost:8080/publishers/${account}/contract/`, {
        params: {publisher_address: account},
      })
      .then((res) => {
        if (res.data) {
          dispatch(creatorActions.updateCreator("contract", res.data));

          var Subscription = new ethers.Contract(
            res.data.address,
            SubscriptionContract.abi,
            signer
          );

          dispatch(
            creatorActions.updateCreator("contractInstance", Subscription)
          );
        }
      });
  };
};
