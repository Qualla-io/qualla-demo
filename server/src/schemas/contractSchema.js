import {gql} from "apollo-server";

export default gql`
  type Contract {
    id: ID!
    publisher: User
    subscribers: [User!]
    acceptedValues: [Float!]
    paymentTokens: [String!]
    publisherNonce: Int

    # tiers: [Tier]
  }
  extend type Query {
    contract(id: ID!): Contract
    contracts: [Contract!]
  }
  extend type Mutation {
    #   #   createContract(id: String!, publisher: String!, tiers: [Tier!])
    createContract(publisher: String!, values: [Float!]!): Contract
  }
`;
