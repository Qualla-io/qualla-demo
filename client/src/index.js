import React from "react";
import ReactDOM from "react-dom";
import App, {accountVar} from "./App";
import {Provider} from "react-redux";

import {ApolloClient, InMemoryCache, ApolloProvider} from "@apollo/client";
import {client} from "./cache";

// import * as serviceWorker from './serviceWorker';

if (!process.env.REACT_APP_GRAPHQL_ENDPOINT) {
  throw new Error(
    "REACT_APP_GRAPHQL_ENDPOINT environment variable not defined"
  );
}

ReactDOM.render(
  <ApolloProvider client={client}>
      <App />
  </ApolloProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
