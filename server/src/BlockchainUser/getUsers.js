import { createApolloFetch } from "apollo-fetch";
// import { gql } from "apollo-server";

const fetch = createApolloFetch({
  uri: process.env.GRAPH_URI,
});

const GET_USER = `
  query GetUser($id: String!) {
    user(id: $id) {
      id
      nonce
      baseTokens {
        id
      }
      subscriptions {
        id
      }
      subscribers {
        id
      }
    }
  }
`;

export async function getUser(id) {
  const res = await fetch({
    query: GET_USER,
    variables: { id },
  });
  if (res.data.user) {
    return res.data.user;
  } else {
    return {
      id: id,
      baseTokens: null,
      subscriptions: null,
      subscribers: null,
      nonce: -1,
    };
  }
}

const GET_USERS = `
  query GetUsers {
    users {
      id
      nonce
      baseTokens {
        id
      }
      subscriptions {
        id
      }
      subscribers {
        id
      }
    }
  }
`;

export async function getUsers() {
  const res = await fetch({
    query: GET_USERS,
  });
  return res.data.users;
}
