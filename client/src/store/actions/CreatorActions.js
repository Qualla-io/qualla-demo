import * as actionTypes from "./actionTypes";
import store from "../myStore";

export const updateCreator = (key, value) => {
    return {
      type: actionTypes.UPDATE_CREATOR,
      key: key,
      value: value,
    };
  };