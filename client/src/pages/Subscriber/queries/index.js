import { gql } from "@apollo/client";

export const GET_CREATOR_OVERVIEW = gql`
  query getCreatorOvewview($id: ID!) {
    user(id: $id) {
      id
      baseTokens {
        id
        quantity
        paymentToken
        paymentValue
      }
    }
  }
`;

export const PERMIT = gql`
  mutation permitDai($userID: ID!, $signature: String!, $nonce: String!) {
    permit(userID: $userID, signature: $signature, nonce: $nonce)
  }
`;
