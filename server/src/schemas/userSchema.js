import {gql} from "apollo-server";

export default gql`
  type User {
    id: ID!
    username: String
    contract: Contract
    subscriptions: [Subscription!]
  }
  type Subscription{
    id: ID!
    subscriber: User!
    contract: Contract!
    value: Float!
    paymentToken: String
    subNum: Float!
    hash: String
    signedHash: String
    nextWithdraw: Float
    nonce: Float
  }
  extend type Query {
    user(id: ID!): User
    users: [User!]
  }
  extend type Mutation {
    user(id: ID!, username: String!): User
    mintTokens(id: ID!): User
  }
`;
