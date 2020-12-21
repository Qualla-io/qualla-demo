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
        description
        title
        avatarID
        initialSupply
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

export const MINT_ONE = gql`
  mutation mintOne(
    $userID: ID!
    $quantity: String!
    $paymentValue: String!
    $signature: String!
    $title: String!
    $description: String!
    $avatarID: String!
  ) {
    mint(
      userID: $userID
      quantity: $quantity
      paymentValue: $paymentValue
      signature: $signature
      title: $title
      description: $description
      avatarID: $avatarID
    )
  }
`;

export const MINT_BATCH = gql`
  mutation mintBatch(
    $userID: ID!
    $quantity: [String]!
    $paymentValue: [String]!
    $signature: String!
    $title: [String]!
    $description: [String]!
    $avatarID: [String]!
  ) {
    mintBatch(
      userID: $userID
      quantity: $quantity
      paymentValue: $paymentValue
      signature: $signature
      title: $title
      description: $description
      avatarID: $avatarID
    )
  }
`;
