import { gql } from "@apollo/client";

export const GET_USER_DETAILS = gql`
  query getUserDetails($id: ID!) {
    user(id: $id) {
      id
      username
      avatar
      coverPhoto
      url
      baseTokens {
        id
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser(
    $id: ID!
    $username: String
    $url: String
    $avatar: Float
    $coverPhoto: Float
    $description: String
  ) {
    updateUser(
      id: $id
      username: $username
      url: $url
      avatar: $avatar
      coverPhoto: $coverPhoto
      description: $description
    ) {
      id
      username
      avatar
      coverPhoto
      url
    }
  }
`;
