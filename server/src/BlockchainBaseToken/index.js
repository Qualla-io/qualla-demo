import { ApolloServer, gql, UserInputError } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";

import { getBaseToken, getBaseTokens } from "./getBaseToken";

const typeDefs = gql`
  type Query {
    baseToken(id: ID!): BaseToken
    baseTokens: [BaseToken!]
  }

  extend type User @key(fields: "id") {
    id: ID! @external
  }

  #   TODO: Make External below
  type BaseToken @key(fields: "id") {
    id: ID!
    quantity: Float!
    owner: User!
    paymentValue: Float!
    paymentToken: String!
    activeTokens: [SubscriptionToken!]
  }

  extend type SubscriptionToken @key(fields: "id") {
    id: ID! @external
  }
`;

const resolvers = {
  Query: {
    baseToken: async (_, { id }) => {
      return await getBaseToken(id.toLowerCase());
    },
    baseTokens: async () => await getBaseTokens(),
  },
  BaseToken: {
    __resolveReference(baseToken) {
      return getBaseToken(baseToken.id.toLowerCase());
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

server.listen(4002).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
