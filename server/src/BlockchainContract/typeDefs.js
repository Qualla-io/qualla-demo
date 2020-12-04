import {gql} from "apollo-server";

export const typeDefs = gql`
  type Query {
    contract(id: ID!): Contract
    contracts: [Contract!]
  }

  type Mutation {
    createContract(publisher: ID!, tiers: [TierInput!]!): Contract!
    modifyContract(
      id: String!
      tiers: [TierInput!]!
      signedHash: String!
    ): Contract!
    fakeSub(id: ID!): Contract!
    subscribe(
      contractID: ID!
      userID: ID!
      value: String!
      signedHash: String!
    ): Contract!
    withdraw(id: ID!): Boolean!
  }

  input TierInput {
    id: ID
    value: Float!
    perks: String!
    title: String!
  }

  extend type User @key(fields: "id") {
    id: ID! @external
  }

  extend type SubscriptionObj @key(fields: "id") {
    id: ID! @external
  }

  type Contract @key(fields: "id") {
    id: ID!
    publisher: User!
    subscribers: [SubscriptionObj!]
    acceptedValues: [Float!]
    paymentTokens: [String!]
    publisherNonce: Int
    factory: ContractFactory!
  }

  type ContractFactory @key(fields: "id") {
    id: ID!
    fee: Float!
  }
`;
