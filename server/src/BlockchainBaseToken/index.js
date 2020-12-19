import { ApolloServer, gql, UserInputError } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { ethers } from "ethers";

import { getBaseToken, getBaseTokens } from "./getBaseToken";
import { subscriptionV1, dai } from "./utils";

const typeDefs = gql`
  type Query {
    baseToken(id: ID!): BaseToken
    baseTokens: [BaseToken!]
  }

  type Mutation {
    subscribe(userID: ID!, baseTokenID: ID!, signature: String!): Boolean!
    mint(
      userID: ID!
      quantity: String!
      paymentValue: String!
      signature: String!
    ): Boolean!
    mintBatch(
      userID: ID!
      quantity: [String]!
      paymentValue: [String]!
      signature: String!
    ): Boolean!
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
  Mutation: {
    subscribe: async (_, { userID, baseTokenID, signature }) => {
      signature = ethers.utils.splitSignature(signature);

      // validate userID and baseTokenID

      await subscriptionV1.buySubscription(
        userID,
        baseTokenID,
        signature.v,
        signature.r,
        signature.s
      );

      // How to get subscription token?
      return true;
    },
    mint: async (_, { userID, quantity, paymentValue, signature }) => {
      signature = ethers.utils.splitSignature(signature);

      let abiCoder = ethers.utils.defaultAbiCoder;

      let data = abiCoder.encode(
        ["address[]", "uint256[]"],
        [[dai.address], [ethers.utils.parseEther(paymentValue).toString()]]
      );

      await subscriptionV1.mintSubscription(
        userID,
        quantity,
        signature.v,
        signature.r,
        signature.s,
        data
      );

      return true;
    },
    mintBatch: async (_, { userID, quantity, paymentValue, signature }) => {
      signature = ethers.utils.splitSignature(signature);

      let abiCoder = ethers.utils.defaultAbiCoder;

      let _addresses = [];
      let _values = [];

      for (var i = 0; i < paymentValue.length; i++) {
        _addresses.push(dai.address);
        _values.push(ethers.utils.parseEther(paymentValue[i]).toString());
      }

      let data = abiCoder.encode(
        ["address[]", "uint256[]"],
        [_addresses, _values]
      );

      await subscriptionV1.mintBatchSubscription(
        userID,
        quantity,
        signature.v,
        signature.r,
        signature.s,
        data
      );

      return true;
    },
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
