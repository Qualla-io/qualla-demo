import { ApolloServer, gql, UserInputError } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { ethers } from "ethers";

import { getSubToken, getSubTokens } from "./getSubToken";
import { subscriptionV1 } from "./utils";

const typeDefs = gql`
  type Query {
    subscriptionToken(id: ID!): SubscriptionToken
    subscriptionTokens: [SubscriptionToken!]
  }

  type Mutation {
    unsubscribe(userID: ID!, tokenID: ID!, signature: String!): Boolean!
  }

  extend type User @key(fields: "id") {
    id: ID! @external
  }

  extend type BaseToken @key(fields: "id") {
    id: ID! @external
  }

  type SubscriptionToken @key(fields: "id") {
    id: ID!
    owner: User!
    creator: User!
    nextWithdraw: Float!
    baseToken: BaseToken!
  }
`;

const resolvers = {
  Query: {
    subscriptionToken: async (_, { id }) => {
      return await getSubToken(id.toLowerCase());
    },
    subscriptionTokens: async () => await getSubTokens(),
  },
  Mutation: {
    unsubscribe: async (_, { userID, tokenID, signature }) => {
      signature = ethers.utils.splitSignature(signature);

      await subscriptionV1.unSubscribe(
        userID,
        tokenID,
        signature.v,
        signature.r,
        signature.s
      );

      return true;
    },
  },
  SubscriptionToken: {
    __resolveReference(subscriptionToken) {
      return getSubToken(subscriptionToken.id.toLowerCase());
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

server.listen(4003).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
