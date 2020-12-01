import {makeVar, ApolloClient, InMemoryCache} from "@apollo/client";

export const accountVar = makeVar(null);
export const factoryVar = makeVar(null);
export const providerVar = makeVar(null);
export const signerVar = makeVar(null);
export const daiVar = makeVar(null);
export const subscriptionVar = makeVar(null);
export const contractIDVar = makeVar(null);

export const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  cache: new InMemoryCache({}),
});
