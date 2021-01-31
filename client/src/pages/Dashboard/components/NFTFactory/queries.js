import { gql } from "@apollo/client";

export const GET_NFT_FACTORY_DATA = gql`
  query getNftFactoryData($id: ID!) {
    user(id: $id) {
      id
      nonce
      baseTokens {
        id
        title
        activeTokens {
          id
        }
      }
      createdNFTs {
        id
        title
        description
      }
    }
  }
`;

export const MINT_NFT = gql`
  mutation mintNft(
    $userID: ID!
    $signature: String!
    $title: String!
    $description: String!
    $baseTokens: [String!]
    $gifIndex: Float!
  ) {
    mintNft(
      userID: $userID
      signature: $signature
      title: $title
      description: $description
      baseTokens: $baseTokens
      gifIndex: $gifIndex
    )
  }
`;

// export const MINT_NFT = gql`
//   mutation mintNFT($userID: string) {
//     mintNFT(userID: $userID)
//   }
// `;
