import { ApolloServer, gql, UserInputError } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import { v4 as uuidv4 } from "uuid";
import { connect, NatsConnectionOptions, Payload } from "ts-nats";

import { getBaseToken, getBaseTokens, getNFT, getNFTs } from "./getBaseToken";
import { dai, account, diamond, erc1155, subscriptions, nft } from "./utils";

let nc;

const typeDefs = gql`
  type Query {
    baseToken(id: ID!): BaseToken
    baseTokens: [BaseToken!]
    nft(id: ID!): Nft
    nfts: [Nft!]
  }

  type Mutation {
    subscribe(userID: ID!, baseTokenID: ID!, signature: String!): Boolean!
    fakeSubscribe(baseTokenID: ID!): Boolean!
    mint(
      userID: ID!
      quantity: String!
      paymentValue: String!
      signature: String!
      title: String!
      description: String!
      avatarID: String!
    ): Boolean!
    mintBatch(
      userID: ID!
      quantity: [String]!
      paymentValue: [String]!
      signature: String!
      title: [String]!
      description: [String]!
      avatarID: [String]!
    ): Boolean!
    burnOrModify(
      baseTokenID: ID!
      baseTokenTxHash: String!
      quantity: String!
      signature: String!
      title: String!
      description: String!
      avatarID: String!
    ): Boolean!
    mintNft(
      userID: ID!
      amount: Float!
      signature: String!
      metaData: String!
    ): Boolean!
  }

  extend type User @key(fields: "id") {
    id: ID! @external
  }

  type BaseToken @key(fields: "id") @key(fields: "txHash") {
    id: ID!
    quantity: String!
    owner: User!
    paymentValue: String!
    paymentToken: String!
    activeTokens: [SubscriptionToken!]
    txHash: ID!
    initialSupply: String!
    index: String!
  }

  extend type SubscriptionToken @key(fields: "id") {
    id: ID! @external
    # baseToken: BaseToken! @external
  }

  type Nft @key(fields: "id") {
    id: ID!
    creator: User!
    owner: User!
    uriID: String!
  }
`;

const resolvers = {
  Query: {
    baseToken: async (_, { id }) => {
      return await getBaseToken(id.toLowerCase());
    },
    baseTokens: async () => await getBaseTokens(),
    nft: async (_, { id }) => {
      return await getNFT(id.toLowerCase());
    },
    nfts: async () => await getNFTs(),
  },
  Mutation: {
    subscribe: async (_, { userID, baseTokenID, signature }) => {
      let _baseToken = await getBaseToken(baseTokenID.toLowerCase());

      if (!_baseToken) {
        throw new UserInputError("Invalid baseTokenID", {
          invalidArgs: Object.keys(baseTokenID),
        });
      }

      signature = ethers.utils.splitSignature(signature);

      // TODO: validate userID matches user recovered from signature

      await subscriptions.buySubscription(
        userID,
        baseTokenID,
        signature.v,
        signature.r,
        signature.s
      );

      return true;
    },
    fakeSubscribe: async (_, { baseTokenID }) => {
      let _baseToken = await getBaseToken(baseTokenID.toLowerCase());

      if (!_baseToken) {
        throw new UserInputError("Invalid baseTokenID", {
          invalidArgs: Object.keys(baseTokenID),
        });
      }

      let nonce = await erc1155.getUserNonce(account.address);

      let domain = {
        name: "Qualla Subscription",
        version: "1",
        chainId: 31337,
        verifyingContract: diamond.address,
      };

      let creatorTypes = {
        User: [
          { name: "user", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "action", type: "string" },
        ],
      };

      let subscriberData = {
        user: account.address,
        nonce: nonce.toString(),
        action: "subscribe",
      };

      // changed from signer
      let signature = await account._signTypedData(
        domain,
        creatorTypes,
        subscriberData
      );

      signature = ethers.utils.splitSignature(signature);

      await subscriptions.buySubscription(
        account.address,
        baseTokenID,
        signature.v,
        signature.r,
        signature.s
      );

      return true;
    },
    mint: async (
      _,
      {
        userID,
        quantity,
        paymentValue,
        signature,
        title,
        description,
        avatarID,
      }
    ) => {
      signature = ethers.utils.splitSignature(signature);

      let res = await subscriptions.mintSubscription(
        userID,
        quantity,
        dai.address,
        ethers.utils.parseEther(paymentValue).toString(),
        signature.v,
        signature.r,
        signature.s
      );

      let msg = {
        action: "mint",
        txHash: res.hash,
        title: [title],
        description: [description],
        avatarID: [avatarID],
      };

      nc.publish("local", msg);
      console.log(" [x] Sent %s: '%s'", "local", msg);

      return true;
    },
    mintBatch: async (
      _,
      {
        userID,
        quantity,
        paymentValue,
        signature,
        title,
        description,
        avatarID,
      }
    ) => {
      signature = ethers.utils.splitSignature(signature);

      let _addresses = [];
      let _values = [];

      for (var i = 0; i < paymentValue.length; i++) {
        _addresses.push(dai.address);
        _values.push(ethers.utils.parseEther(paymentValue[i]).toString());
      }

      let res = await subscriptions.mintBatchSubscription(
        userID,
        quantity,
        _addresses,
        _values,
        signature.v,
        signature.r,
        signature.s
      );

      let msg = {
        action: "mint",
        txHash: res.hash,
        title: title,
        description: description,
        avatarID: avatarID,
      };

      nc.publish("local", msg);
      console.log(" [x] Sent %s: '%s'", "local", msg);

      return true;
    },
    burnOrModify: async (
      _,
      {
        baseTokenID,
        baseTokenTxHash,
        quantity,
        signature,
        title,
        description,
        avatarID,
      }
    ) => {
      quantity = new BigNumber(quantity);

      if (quantity.gt(0)) {
        signature = ethers.utils.splitSignature(signature);

        await subscriptions.burnSubscription(
          baseTokenID,
          quantity.toFixed(),
          signature.v,
          signature.r,
          signature.s
        );
      }

      let msg = {
        action: "modify",
        txHash: [baseTokenTxHash],
        title: [title],
        description: [description],
        avatarID: [avatarID],
      };

      nc.publish("local", msg);
      console.log(" [x] Sent %s: '%s'", "local", msg);

      return true;
    },
    mintNft: async (_, { userID, amount, signature, metadata }) => {
      signature = ethers.utils.splitSignature(signature);

      let uriID = uuidv4();

      await nft.mintBatchNFT(
        userID.toLowerCase(),
        amount,
        uriID,
        signature.v,
        signature.r,
        signature.s
      );

      let msg = {
        action: "mintNFT",
        uriID: uriID,
        metadata: metadata,
      };

      nc.publish("local", msg);
      console.log(" [x] Sent %s: '%s'", "local", msg);
    },
  },
  BaseToken: {
    __resolveReference(baseToken) {
      return getBaseToken(baseToken.id.toLowerCase());
    },
  },
  Nft: {
    __resolveReference(nft) {
      return getNFT(nft.id.toLowerCase());
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

async function natsConn() {
  try {
    nc = await connect({
      servers: [`${process.env.NATS}:4222`],
      payload: Payload.JSON,
    });

    nc.subscribe("chain.base", (err, msg) => {
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
