import {makeVar, ApolloClient, InMemoryCache} from "@apollo/client";

export const accountVar = makeVar("");
export const factoryVar = makeVar();
export const providerVar = makeVar();
export const signerVar = makeVar();
export const daiVar = makeVar();

export const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          account: {
            read() {
              return accountVar();
            },
          },
        },
      },
    },
  }),
});
