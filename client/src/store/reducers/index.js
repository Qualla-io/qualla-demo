import {combineReducers} from "redux";
import Web3Reducer from "./Web3";
import CreatorReducer from "./Creator";
import SubscriberReducer from "./Subscriber";

import {ApolloClient, InMemoryCache} from "@apollo/client";

export const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
});

export default combineReducers({
  Web3Reducer,
  CreatorReducer,
  SubscriberReducer,
  apollo: client.reducer(),
});
