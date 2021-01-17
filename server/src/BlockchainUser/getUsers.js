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
      approved
      balance
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
      nonce: 0,
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

const GET_SUBBED_TO = `
  query GetSubbedTo($userID: ID!, $creatorID: String!) {
    user(id: $userID) {
      id
      nonce
      subscriptions(where: {creator: $creatorID}) {
        id
        creator {
          id
        }
        owner {
          id
        }
        baseToken {
          id
        }
      }
    }
  }
`;

export async function getSubbedTo(userID, creatorID) {
  const res = await fetch({
    query: GET_SUBBED_TO,
    variables: { userID, creatorID },
  });
  console.log(res)
  return res.data.user;
}