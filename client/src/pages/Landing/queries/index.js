import { gql } from "@apollo/client";

export const GET_USER_OVERVIEW = gql`
  query gerUserOverview($id: ID!) {
    user(id: $id) {
      id
      nonce
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
      baseTokens {
        id
        paymentValue
        paymentToken
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
      subscriptions {
        id
        creator {
          id
        }
        baseToken {
          id
          paymentValue
          paymentToken
        }
      }
    }
  }
`;
