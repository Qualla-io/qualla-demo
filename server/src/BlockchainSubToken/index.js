import { ApolloServer, gql, UserInputError } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { ethers } from "ethers";
import { connect, NatsConnectionOptions, Payload } from "ts-nats";

import { getSubToken, getSubTokens } from "./getSubToken";
import { dai, account, diamond, erc1155, subscriptions, nft } from "./utils";

let nc;

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
    owner: User
    creator: User!
    nextWithdraw: String!
    baseToken: BaseToken
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

      await subscriptions.unSubscribe(
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
    async __resolveReference(subscriptionToken) {
      return await getSubToken(subscriptionToken.id.toString());
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

async function natsConn() {
  try {
    nc = await connect({
      servers: [`${process.env.NATS}:4222`],
      payload: Payload.JSON,
    });

    nc.subscribe("chain.sub", (err, msg) => {
      if (err) {
      } else {
        let data = msg.data;
        switch (data.action) {
          default:
            console.log(data);
            break;
        }
      }
    });
  } catch {
    console.log("NATS connection error");
  }
}

natsConn();
