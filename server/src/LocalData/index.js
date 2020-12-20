import { ApolloServer, gql } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import amqp from "amqplib/callback_api";

import UserModel from "./models/user";
import BaseTokenModel from "./models/baseToken";

import mongoose from "mongoose";

let _channel;
let exchange = "direct_services";

const typeDefs = gql`
  type Mutation {
    username(id: ID!, username: String): User
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    username: String
  }

  extend type BaseToken @key(fields: "txHash") {
    txHash: ID! @external
    title: String @requires(fields: "txHash")
    description: String
    avatarID: Float
  }
`;

const resolvers = {
  Mutation: {
    username: async (_, { id, username }) => {
      let _user = await UserModel.findById(id.toLowerCase()).exec();

      if (_user === null) {
        _user = await User.create({ _id: id.toLowerCase() });
      }

      _user.username = username;
      await _user.save();

      return _user.toJSON();
    },
  },
  User: {
    username: async (user) => {
      let _user = await UserModel.findById(user.id.toLowerCase());
      if (_user) {
        return _user.username;
      } else {
        return user.id.toLowerCase();
      }
    },
  },
  BaseToken: {
    title: async (baseToken) => {

      let _baseToken = await BaseTokenModel.findById(baseToken.txHash.toLowerCase());

      if (_baseToken) {
        return _baseToken.title;
      } else {
        return null;
      }
    },
    description: async (baseToken) => {

      let _baseToken = await BaseTokenModel.findById(baseToken.txHash.toLowerCase());

      if (_baseToken) {
        return _baseToken.description;
      } else {
        return null;
      }
    },
    avatarID: async (baseToken) => {
      let _baseToken = await BaseTokenModel.findById(baseToken.txHash.toLowerCase());

      if (_baseToken) {
        return _baseToken.avatarID;
      } else {
        return null;
      }
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

// Save local data from events
// Probably move this to another file

// test this
async function handleMint(data) {

  console.log(data)
  // data structure:
  // {
  //     action: "mint",
  //     txHash: "...",
  //     title: ["...", "..."],
  //     description: ["...", "..."],
  //     avatarID: ["...", "..."]
  // }

  for (var i = 0; i < data.title.length; i++) {
    let _baseToken = new BaseTokenModel();

    _baseToken._id = data.txHash.toLowerCase() + "-" + i.toString()
    _baseToken.title = data.title[i];
    _baseToken.description = data.description[i];
    _baseToken.avatarID = parseInt(data.avatarID[i]);

    console.log(_baseToken)

    await _baseToken.save();
  }
}

server.listen(4004).then(({ url }) => {
  mongoose.set("useUnifiedTopology", true);
  mongoose.set("useNewUrlParser", true);
  //   mongoose.connect("mongodb://root:example@0.0.0.0:27017/local");
  mongoose.connect("mongodb://root:example@mongo:27017");
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

        channel.bindQueue(q.queue, exchange, "Local");

        channel.consume(
          q.queue,
          function (msg) {
            let data = JSON.parse(msg.content.toString());

            // Add try catch here
            switch (data.action) {
              case "mint":
                handleMint(data);
                break;
              default:
                console.log(data);
            }
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
