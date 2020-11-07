import * as actionTypes from "./actionTypes";

import store from "../myStore";
import axios from "axios";
import {ethers} from "ethers";
import SubscriptionContract from "../../contracts/SubscriptionV1.json";

export const updateSubscriber = (key, value) => {
  return {
    type: actionTypes.UPDATE_SUBSCRIBER,
    key: key,
    value: value,
  };
};

export const updateContract = () => {
  return (dispatch) => {
    var state = store.getState().Web3Reducer;
    const account = process.env.REACT_APP_NOT_SECRET_CODE;
    const signer = state.signer;

    axios
      .get(`http://localhost:8080/publishers/${account}/contract/`, {
        params: {publisher_address: account},
      })
      .then((res) => {
        if (res.data) {
          console.log(res.data);
          dispatch(updateSubscriber("contract", res.data));

          var Subscription = new ethers.Contract(
            res.data.address,
            SubscriptionContract.abi,
            signer
          );

          dispatch(updateSubscriber("contractInstance", Subscription));
        }
      });
  };
};
