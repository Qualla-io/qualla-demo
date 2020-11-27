import {gql} from "apollo-server";

export default gql`
  type Subscription {
    id: ID!
    subscriber: User!
    contract: Contract!
    value: Float!
    status: Status!
    paymentToken: String
    subNum: Float!
    hash: String
    signedHash: String
    nextWithdraw: Float
    nonce: Float
  }
  enum Status {
    ACTIVE
    PAUSED
    CANCELED
    EXPIRED
  }
  extend type Query {
    subscription(id: ID!): Subscription
  }
  extend type Mutation {
    subscribe(user: ID!): Contract!
    fakeSub(contract: ID!): Contract!
  }
`;
