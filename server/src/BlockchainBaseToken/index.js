import { ApolloServer, gql, UserInputError } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import amqp from "amqplib/callback_api";

import { getBaseToken, getBaseTokens } from "./getBaseToken";
import { subscriptionV1, dai, account, signer } from "./utils";

let _channel;
let exchange = "direct_services";

const typeDefs = gql`
  type Query {
    baseToken(id: ID!): BaseToken
    baseTokens: [BaseToken!]
  }

  type Mutation {
    subscribe(
      userID: ID!
      baseTokenID: ID!
      signature: String!
    ): SubscriptionToken!
    fakeSubscribe( baseTokenID: ID!): Boolean!
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
      let _baseToken = await getBaseToken(baseTokenID.toLowerCase());

      if (!_baseToken) {
        throw new UserInputError("Invalid baseTokenID", {
          invalidArgs: Object.keys(baseTokenID),
        });
      }

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

      let _subscriptionToken = {};

      console.log(_baseToken.id);
      console.log(_baseToken.index);

      let _baseID = new BigNumber(_baseToken.id);
      // This doesnt actually work accurately
      _subscriptionToken.id = _baseID.plus(_baseToken.index).plus(1).toFixed();

      return _subscriptionToken;
    },
    fakeSubscribe: async (_, { baseTokenID }) => {

      let _baseToken = await getBaseToken(baseTokenID.toLowerCase());

      if (!_baseToken) {
        throw new UserInputError("Invalid baseTokenID", {
          invalidArgs: Object.keys(baseTokenID),
        });
      }

      let nonce = await subscriptionV1.userNonce(account.address);

      let domain = {
        name: "Qualla Subscription",
        version: "1",
        chainId: 31337,
        verifyingContract: subscriptionV1.address,
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

      let signature = await signer._signTypedData(
        domain,
        creatorTypes,
        subscriberData
      );

      signature = ethers.utils.splitSignature(signature);

      await subscriptionV1.buySubscription(
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

      let abiCoder = ethers.utils.defaultAbiCoder;

      let data = abiCoder.encode(
        ["address[]", "uint256[]"],
        [[dai.address], [ethers.utils.parseEther(paymentValue).toString()]]
      );

      let res = await subscriptionV1.mintSubscription(
        userID,
        quantity,
        signature.v,
        signature.r,
        signature.s,
        data
      );

      let localData = {
        action: "mint",
        txHash: res.hash,
        title: [title],
        description: [description],
        avatarID: [avatarID],
      };

      let msg = JSON.stringify(localData);

      _channel.publish(exchange, "Local", Buffer.from(msg));
      console.log(" [x] Sent %s: '%s'", "Local", msg);

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

      let res = await subscriptionV1.mintBatchSubscription(
        userID,
        quantity,
        signature.v,
        signature.r,
        signature.s,
        data
      );

      let localData = {
        action: "mint",
        txHash: res.hash,
        title: title,
        description: description,
        avatarID: avatarID,
      };

      let msg = JSON.stringify(localData);

      _channel.publish(exchange, "Local", Buffer.from(msg));
      console.log(" [x] Sent %s: '%s'", "Local", msg);

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

        await subscriptionV1.burnSubscription(
          baseTokenID,
          quantity.toFixed(),
          signature.v,
          signature.r,
          signature.s
        );
      }

      let localData = {
        action: "modify",
        txHash: [baseTokenTxHash],
        title: [title],
        description: [description],
        avatarID: [avatarID],
      };

      let msg = JSON.stringify(localData);

      _channel.publish(exchange, "Local", Buffer.from(msg));
      console.log(" [x] Sent %s: '%s'", "Local", msg);

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

amqp.connect("amqp://root:example@rabbitmq", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    channel.assertExchange(exchange, "direct", {
      durable: false,
    });

    channel.assertQueue(
      "",
      {
        exclusive: true,
      },
      function (error2, q) {
        if (error2) {
          throw error2;
        }
        console.log(" [*] Waiting for logs. To exit press CTRL+C");

        channel.bindQueue(q.queue, exchange, "BaseToken");

        channel.consume(
          q.queue,
          function (msg) {
            console.log(
              " [x] %s: '%s'",
              msg.fields.routingKey,
              msg.content.toString()
            );
          },
          {
            noAck: true,
          }
        );
      }
    );

    _channel = channel;
  });
});
