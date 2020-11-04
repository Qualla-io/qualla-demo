import {combineReducers} from "redux";
import Web3Reducer from "./Web3";
import CreatorReducer from "./Creator";

export default combineReducers({
  Web3Reducer,
  CreatorReducer,
});
