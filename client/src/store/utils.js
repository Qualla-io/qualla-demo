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

