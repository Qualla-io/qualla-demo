import {gql} from "apollo-server";

export default gql`
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
    subscription(id: ID!): Subscription
  }
  extend type Mutation {
    subscribe(user: ID!): Subscription!
    fakeSub(contract: ID!): Subscription!
  }


  
`;
