import { ApolloServer, gql, UserInputError } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import { connect, NatsConnectionOptions, Payload } from "ts-nats";

import {
  getUser,
  getUsers,
  getSubbedTo,
  getBalance,
  getBalancesOf,
  getQToken,
  getQTokens,
  // getTransaction,
  // getTransactions,
  // getUserTransactionsTo,
  // getUserTransactionsFrom,
} from "./getUsers";

import { factoryFacet } from "./utils";

let nc;

const typeDefs = gql`
  type Query {
    user(id: ID!): User
    users: [User!]
    userSubscribedTo(userID: ID!, creatorID: ID!): User
    balance(id: ID!): Balance
    balancesOf(userID: ID!): [Balance!]
    qToken(id: ID!): Qtoken
    qTokens: [Qtoken!]
    # transaction(id: ID!): Transaction
    # transactions: [Transaction!]
    # userTransactionsTo(id: ID!): [Transaction!]
    # userTransactionsFrom(id: ID!): [Transaction!]
  }

  type Mutation {
    mintDai(userID: ID!, qToken: ID!, amt: String!): Boolean!
    testPub(msg: String!): Boolean!
  }

  type User @key(fields: "id") {
    id: ID!
    balances: [Balance!]
    tierTokens: [TierToken!]
    beamTokens: [BeamToken!]
    subscribers: [BeamToken!]
    nonce: Float!
    ownedNFTs: [Nft!]
    createdNFTs: [Nft!]
  }

  type Balance @key(fields: "id") {
    id: ID!
    qtoken: Qtoken!
    user: User!
    settledBalance: String!
    netFlowrate: String!
    netDeposit: String!
    lastUpdated: String!
  }

  type Qtoken @key(fields: "id") {
    id: ID!
    underlyingToken: String!
    name: String!
    symbol: String!
    decimals: String!
    totalSupply: String!
  }

  # type Transaction @key(fields: "id") {
  #   id: ID!
  #   amount: String!
  #   to: User!
  #   from: User
  #   timestamp: Float!
  # }

  extend type TierToken @key(fields: "id") {
    id: ID! @external
  }

  extend type BeamToken @key(fields: "id") {
    id: ID! @external
  }

  extend type Nft @key(fields: "id") {
    id: ID! @external
  }
`;

const resolvers = {
  Query: {
    user: async (_, { id }) => {
      return await getUser(id.toLowerCase());
    },
    users: async () => await getUsers(),
    userSubscribedTo: async (_, { userID, creatorID }) => {
      return await getSubbedTo(userID.toLowerCase(), creatorID.toLowerCase());
    },
    balance: async (_, { id }) => {
      console.log(id);
      return await getBalance(id.toLowerCase());
    },
    balancesOf: async (_, { userID }) => {
      return await getBalancesOf(userID.toLowerCase());
    },
    qToken: async (_, { id }) => {
      return await getQToken(id.toLowerCase());
    },
    qTokens: async () => await getQTokens(),
    // transaction: async (_, { id }) => {
    //   return await getTransaction(id.toLowerCase());
    // },
    // transactions: async () => await getTransactions(),
    // userTransactionsTo: async (_, { id }) => {
    //   return await getUserTransactionsTo(id.toLowerCase());
    // },
    // userTransactionsFrom: async (_, { id }) => {
    //   return await getUserTransactionsFrom(id.toLowerCase());
    // },
  },
  Mutation: {
    mintDai: async (_, { userID, qToken, amt }) => {
      let _user = await getUser(userID.toLowerCase());

      let initBal;

      if (_user?.balances[qToken]?.settledBalance) {
        initBal = _user.balances[qToken].settledBalance;
      } else {
        initBal = "0";
      }

      initBal = new BigNumber(initBal);

      console.log(`Old balance: ${initBal.toFixed()}`);

      if (initBal.lt(3000000000000000000000)) {
        await factoryFacet.demoMintWrappedERC20(
          qToken,
          userID.toLowerCase(),
          amt
        );
      } else {
        throw new UserInputError("Excessive funds, don't be greedy!", {
          invalidArgs: Object.keys(userID),
        });
      }

      return true;
    },
    testPub: async (_, { msg }) => {
      nc.publish("chain.sub", { action: "test", payload: msg });
      nc.publish("chain.base", { action: "test", payload: msg });
      console.log(" [x] Sent %s: '%s'", "SubToken", msg);
      console.log(" [x] Sent %s: '%s'", "BaseToken", msg);
      return true;
    },
  },
  User: {
    __resolveReference(user) {
      return getUser(user.id.toLowerCase());
    },
  },
  Balance: {
    __resolveReference(balance) {
      return getBalance(balance.id.toLowerCase());
    },
  },
  qToken: {
    __resolveReference(token) {
      return getBalance(token.id.toLowerCase());
    },
  },
  // Transaction: {
  //   __resolveReference(transaction) {
  //     return getTransaction(transaction.id);
  //   },
  // },
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

async function natsConn() {
  try {
    nc = await connect({
      servers: [`${process.env.NATS}:4222`],
      payload: Payload.JSON,
    });

    nc.subscribe("chain.user", (err, msg) => {
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
