import { createApolloFetch } from "apollo-fetch";
// import { gql } from "apollo-server";

const fetch = createApolloFetch({
  uri: process.env.GRAPH_URI,
});

const GET_SUBTOKEN = `
  query GetSubToken($id: String!) {
    subscriptionToken(id: $id) {
      id
      creator{
        id
      }
      owner{
        id
      }
      nextWithdraw
      baseToken{
        id
      }
    }
  }
`;

export async function getSubToken(id) {
  const res = await fetch({
    query: GET_SUBTOKEN,
    variables: { id },
  });
  if (res.data.subscriptionToken) {
    return res.data.subscriptionToken;
  } else {
    return null;
  }
}

const GET_SUBTOKENS = `
  query GetBaseTokens {
    subscriptionTokens {
      id
      creator{
        id
      }
      owner{
        id
      }
      nextWithdraw
      baseToken{
        id
      }
    }
  }
`;

export async function getSubTokens() {
  const res = await fetch({
    query: GET_SUBTOKENS,
  });
  return res.data.subscriptionTokens;
}
