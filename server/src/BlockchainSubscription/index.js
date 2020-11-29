import {ApolloServer, gql} from "apollo-server";
import {buildFederatedSchema} from "@apollo/federation";

import {getSubscription} from "./subscriptionData";

const typeDefs = gql`
  type Query {
    subscriber(id: ID!): SubscriptionObj
  }

  extend type User @key(fields: "id") {
    id: ID! @external
  }

  extend type Contract @key(fields: "id") {
    id: ID! @external
  }

  type SubscriptionObj @key(fields: "id") {
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
`;

const resolvers = {
  Query: {
    subscriber: async (_, {id}) => {
      return getSubscription(id);
    },
  },
  SubscriptionObj: {
    __resolveReference(subscription) {
      return getSubscription(subscription.id);
    },
    contract: async (subscription) => {
      return {__typename: "Contract", id: subscription.contract.id};
    },
    subscriptions: async (subscription) => {
      return {__typename: "User", id: subscription.subscriber.id};
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});

server.listen(4003).then(({url}) => {
  console.log(`🚀 Server ready at ${url}`);
});
