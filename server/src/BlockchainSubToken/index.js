import { ApolloServer, gql, UserInputError } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";

import { getSubToken, getSubTokens } from "./getSubToken";

const typeDefs = gql`
  type Query {
    subscriptionToken(id: ID!): SubscriptionToken
    subscriptionTokens: [SubscriptionToken!]
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
  SubscriptionToken: {
    __resolveReference(subscriptionToken) {
      return getBaseToken(subscriptionToken.id.toLowerCase());
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
