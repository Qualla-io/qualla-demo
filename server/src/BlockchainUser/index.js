import { ApolloServer, gql, UserInputError } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";

import { getUser, getUsers } from "./getUsers";

const typeDefs = gql`
  type Query {
    user(id: ID!): User
    users: [User!]
  }

  type User @key(fields: "id") {
    id: ID!
    nonce: Float!
    baseTokens: [BaseToken!]
    subscriptions: [SubscriptionToken!]
    subscribers: [SubscriptionToken!]
  }

  extend type BaseToken @key(fields: "id") {
    id: ID! @external
  }

  extend type SubscriptionToken @key(fields: "id") {
    id: ID! @external
  }
`;

const resolvers = {
  Query: {
    user: async (_, { id }) => {
      return await getUser(id.toLowerCase());
    },
    users: async () => await getUsers(),
  },
  User: {
    __resolveReference(user) {
      return getUser(user.id);
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

server.listen(4001).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
