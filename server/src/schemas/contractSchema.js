import {gql} from "apollo-server";

export default gql`
  type Contract {
    id: ID!
    publisher: User
    subscribers: [User!]
    acceptedValues: [Float!]
    paymentTokens: [String!]
    publisherNonce: Int
    tiers: [Tier]
  }
  input TierInput {
    value: Float!
    perks: String!
    title: String!
  }
  extend type Query {
    contract(id: ID!): Contract
    contracts: [Contract!]
  }
  extend type Mutation {
    createContract(publisher: String!, tiers: [TierInput!]!): Contract
    modifyContract(publisher: String!, tiers: [TierInput!]!, signedHash: String!): Contract
  }
`;
