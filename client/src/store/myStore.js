import {createStore, applyMiddleware, compose} from "redux";
import thunk from "redux-thunk";
// import { composeWithDevTools } from "redux-devtools-extension";

import rootReducer, {client} from "./reducers";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk), applyMiddleware(client.middleware()))
);
// const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));

export default store;
