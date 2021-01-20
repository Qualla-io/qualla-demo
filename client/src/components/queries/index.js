import { gql } from "@apollo/client";

export const GET_BALANCE = gql`
  query gerUserBalance($id: ID!) {
    user(id: $id) {
      id
      balance
    }
  }
`;

export const MINT = gql`
  mutation mintDai($userID: ID!, $amt: String!) {
    mintDai(userID: $userID, amt: $amt)
  }
`;
