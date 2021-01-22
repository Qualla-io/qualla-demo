import { gql } from "@apollo/client";

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

export const GET_TRANSACTIONS_TO = gql`
  query getUserTransactionsTo($id: ID!) {
    userTransactionsTo(id: $id) {
      id
      to {
        id
      }
      from {
        id
      }
      amount
      timestamp
    }
  }
`;
