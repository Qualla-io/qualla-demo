import {gql} from "apollo-server";

export default gql`
  type User {
    id: ID!
    username: String
    contract: Contract
    suscriptions: [Contract!]
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
