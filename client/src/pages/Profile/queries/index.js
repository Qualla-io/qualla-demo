import { gql } from "@apollo/client";

export const GET_CREATOR_OVERVIEW = gql`
  query getCreatorOvewview($id: ID!) {
    user(id: $id) {
      id
      username
      baseTokens {
        id
        quantity
        paymentToken
        paymentValue
        title
        avatarID
        description
      }
    }
  }
`;

export const GET_USER_NONCE = gql`
  query getUserNonce($id: ID!) {
    user(id: $id) {
      id
      nonce
    }
  }
`;

export const GET_USER_SUBTOKENS = gql`
  query getUserSubtokens($id: ID!) {
    user(id: $id) {
      idzl
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
          avatarID
          description
        }
      }
    }
  }
`;

export const PERMIT = gql`
  mutation permitDai($userID: ID!, $signature: String!, $nonce: String!) {
    permit(userID: $userID, signature: $signature, nonce: $nonce)
  }
`;

export const SUBSCRIBE = gql`
  mutation subscribe($userID: ID!, $baseTokenID: ID!, $signature: String!) {
    subscribe(
      userID: $userID
      baseTokenID: $baseTokenID
      signature: $signature
    ) {
      id
    }
  }
`;

export const UNSUBSCRIBE = gql`
  mutation unsubscribe($userID: ID!, $tokenID: ID!, $signature: String!) {
    unsubscribe(userID: $userID, tokenID: $tokenID, signature: $signature)
  }
`;
