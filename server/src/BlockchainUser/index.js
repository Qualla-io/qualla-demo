import {ApolloServer, gql} from "apollo-server";
import {buildFederatedSchema} from "@apollo/federation";

import {getUser, getUsers} from "../datasources/userData";

const typeDefs = gql`
  type Query {
    user(id: ID!): User
    users: [User!]
  }

  extend type Contract @key(fields: "id") {
    id: ID! @external
  }

  extend type SubscriptionObj @key(fields: "id") {
    id: ID! @external
  }

  type User @key(fields: "id") {
    id: ID!
    contract: Contract
    subscriptions: [SubscriptionObj!]
  }
`;

const resolvers = {
  Query: {
    user: async (_, {id}) => {
      return getUser(id);
    },
    users: async () => await getUsers(),
  },
  User: {
    __resolveReference(user) {
      return getUser(user.id);
    },
    contract: async (user) => {
      return {__typename: "Contract", id: user.contract.id};
    },
    subscriptions: async (user) => {
      let subs = [];
      for (var i = 0; i < user.subscriptions.length; i++) {
        subs.push({
          __typename: "SubscriptionObj",
          id: user.subscriptions[i].id,
        });
      }
      return subs;
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

server.listen(4001).then(({url}) => {
  console.log(`🚀 Server ready at ${url}`);
});
