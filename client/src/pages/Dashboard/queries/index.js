import { gql } from "@apollo/client";

export const GET_USER_HEADER = gql`
  query gerUserHeader($id: ID!) {
    user(id: $id) {
      id
      username
      nonce
    }
  }
`;

export const GET_USER_OVERVIEW = gql`
  query gerUserOverview($id: ID!) {
    user(id: $id) {
      id
      username
      nonce
      baseTokens {
        id
      }
      subscribers {
        id
        baseToken {
          id
          paymentValue
        }
      }
    }
  }
`;

export const GET_USER_BASETOKENS = gql`
  query getUserBaseTokens($id: ID!) {
    user(id: $id) {
      id
      username
      baseTokens {
        id
        paymentValue
        paymentToken
        title
        avatarID
        description
        activeTokens {
          id
        }
      }
    }
  }
`;

export const GET_USER_SUBSCRIPTIONS = gql`
  query getUserSubscriptions($id: ID!) {
    user(id: $id) {
      id
      username
      subscriptions {
        id
        creator {
          id
        }
        baseToken {
          id
          paymentValue
          paymentToken
          title
          description
          avatarID
        }
      }
    }
  }
`;

export const UPDATE_USERNAME = gql`
  mutation updateUsername($id: ID!, $username: String!) {
    username(id: $id, username: $username) {
      id
      username
    }
  }
`;

export const ADD_SUB = gql`
  mutation addSubscriber($baseTokenID: ID!) {
    fakeSubscribe(baseTokenID: $baseTokenID)
  }
`;
