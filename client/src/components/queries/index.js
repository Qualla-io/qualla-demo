import { gql } from "@apollo/client";

export const MINT = gql`
  mutation mintDai($userID: ID!, $amt: String!) {
    mintDai(userID: $userID, amt: $amt)
  }
`;
