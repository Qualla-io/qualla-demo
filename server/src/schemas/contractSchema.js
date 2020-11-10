import {gql} from "apollo-server";

export default gql`
  type Contract {
    id: ID!
    publisher: User
    subscribers: [User]
    # tiers: [Tier]
  }
  extend type Query {
    contract(id: ID!): Contract!
    contracts: [Contract!]
  }
  extend type Mutation {
    #   #   createContract(id: String!, publisher: String!, tiers: [Tier!])
    createContract(id: String!, publisher: String!): Contract
  }
`;
