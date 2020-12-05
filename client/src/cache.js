import {makeVar, ApolloClient, InMemoryCache} from "@apollo/client";
import {split, HttpLink} from "@apollo/client";
import {getMainDefinition} from "@apollo/client/utilities";
import {WebSocketLink} from "@apollo/client/link/ws";

export const accountVar = makeVar(null);
export const factoryVar = makeVar(null);
export const providerVar = makeVar(null);
export const signerVar = makeVar(null);
export const daiVar = makeVar(null);
export const subscriptionVar = makeVar(null);
export const contractIDVar = makeVar(null);
export const ethVar = makeVar(null);

const wsLink = new WebSocketLink({
  uri: process.env.REACT_APP_GRAPHQL_SUB_ENDPOINT,
  options: {
    reconnect: true,
  },
});

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
});

const link = split(
  ({query}) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  cache: new InMemoryCache({}),
  link,
});
