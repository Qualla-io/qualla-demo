import {gql} from "apollo-server";

export default gql`
  type User {
    address: ID!
    username: String
    contract: Contract
    suscriptions: [Contract!]
  }
  extend type Query {
    user(address: ID!): User!
    users: [User!]
  }
  extend type Mutation {
    user(address: String!, username: String!): User
  }
`;
