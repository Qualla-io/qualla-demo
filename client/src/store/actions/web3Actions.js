import * as actionTypes from "./actionTypes";

export const updateWeb3 = (key, value) => {
    return {
      type: actionTypes.UPDATE_WEB3,
      key: key,
      value: value,
    };
  };