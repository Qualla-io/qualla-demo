import { gql } from "@apollo/client";

export const GET_USER_BASETOKENS = gql`
  query getUserBaseTokens($id: ID!) {
    user(id: $id) {
      id
      baseTokens {
        id
        quantity
        paymentValue
        paymentToken
      }
    }
  }
`;
