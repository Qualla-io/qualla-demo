import {ApolloServer, gql, UserInputError} from "apollo-server";
import {buildFederatedSchema} from "@apollo/federation";

import {getUser, getUsers} from "./userData";
import {dai, account} from "./utils";

const typeDefs = gql`
  type Query {
    user(id: ID!): User
    users: [User!]
  }

  type Mutation {
    mintTokens(id: ID!): Boolean!
    permit(
      userID: ID!
      contractID: ID!
      nonce: String!
      expiry: Float!
      allowed: Boolean!
      v: String!
      r: String!
      s: String!
    ): Boolean!
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
      return getUser(id.toLowerCase());
    },
    users: async () => await getUsers(),
  },
  Mutation: {
    mintTokens: async (_, {id}) => {
      const initBal = await dai.balanceOf(id.toLowerCase());
      console.log(`Old balance: ${initBal}`);

      if (initBal < 3000000000000000000000) {
        await dai.mintTokens(id.toLowerCase());
      } else {
        throw new UserInputError("Excessive funds, don't be greedy!", {
          invalidArgs: Object.keys(id),
        });
      }

      return true;
    },
    permit: async (
      _,
      {userID, contractID, nonce, expiry, allowed, v, r, s}
    ) => {


      // TODO: Check if already approved
      await dai.permit(userID, contractID, nonce, expiry, allowed, v, r, s);

      return true;
    },
  },
  User: {
    __resolveReference(user) {
      return getUser(user.id);
    },
    contract: async (user) => {
      if (user.contract) {
        return {__typename: "Contract", id: user.contract.id};
      } else {
        return null;
      }
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
