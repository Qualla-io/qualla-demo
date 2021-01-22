import { ApolloServer, gql, UserInputError } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { connect, NatsConnectionOptions, Payload } from "ts-nats";
import validator from "validator";

import UserModel from "./models/user";
import BaseTokenModel from "./models/baseToken";

import mongoose from "mongoose";

let nc;

const typeDefs = gql`
  type Query {
    getUserFromUrl(url: String): User
  }

  type Mutation {
    updateUser(
      id: ID!
      username: String
      avatar: Float
      coverPhoto: Float
      url: String
      description: String
    ): User
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    username: String
    avatar: Float
    coverPhoto: Float
    url: String
    description: String
  }

  extend type BaseToken @key(fields: "txHash") {
    txHash: ID! @external
    title: String @requires(fields: "txHash")
    description: String
    avatarID: Float
  }
`;

const resolvers = {
  Query: {
    getUserFromUrl: async (_, { url }) => {
      return await UserModel.findOne({ url: url }).exec();
    },
  },
  Mutation: {
    updateUser: async (
      _,
      { id, username, avatar, coverPhoto, url, description }
    ) => {
      let _user = await UserModel.findById(id.toLowerCase()).exec();

      if (_user === null) {
        _user = await UserModel.create({ _id: id.toLowerCase() });
      }

      if (username) {
        let _checkUsername = await UserModel.findOne({
          username: username,
        }).exec();
        if (_checkUsername && _checkUsername.id !== id.toLowerCase()) {
          throw new UserInputError("Username taken!", {
            invalidArgs: Object.keys(username),
          });
        }
      }

      if (url) {
        if (!validator.isBase64(url, { urlSafe: true })) {
          throw new UserInputError("Invalid Url!", {
            invalidArgs: Object.keys(url),
          });
        }

        let _checkUrl = await UserModel.findOne({
          url: url,
        }).exec();
        if (_checkUrl && _checkUrl.id !== id.toLowerCase()) {
          throw new UserInputError("Url taken!", {
            invalidArgs: Object.keys(url),
          });
        }
      }

      if (username) {
        _user.username = username;
      }
      if (avatar) {
        _user.avatar = avatar;
      }
      if (coverPhoto) {
        _user.coverPhoto = coverPhoto;
      }
      if (url) {
        _user.url = url;
      }
      if (description) {
        _user.description = description;
      }
    

      await _user.save();

      return _user.toJSON();
    },
  },
  User: {
    __resolveReference(user) {
      return UserModel.findById(user.id.toLowerCase());
    },
    // username: async (user) => {
    //   let _user = await UserModel.findById(user.id.toLowerCase());
    //   if (_user) {
    //     return _user.username;
    //   } else {
    //     return user.id.toLowerCase();
    //   }
    // },
  },
  BaseToken: {
    title: async (baseToken) => {
      let _baseToken = await BaseTokenModel.findById(
        baseToken.txHash.toLowerCase()
      );

      if (_baseToken) {
        return _baseToken.title;
      } else {
        return null;
      }
    },
    description: async (baseToken) => {
      let _baseToken = await BaseTokenModel.findById(
        baseToken.txHash.toLowerCase()
      );

      if (_baseToken) {
        return _baseToken.description;
      } else {
        return null;
      }
    },
    avatarID: async (baseToken) => {
      let _baseToken = await BaseTokenModel.findById(
        baseToken.txHash.toLowerCase()
      );

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

    _baseToken._id = data.txHash.toLowerCase() + "-" + i.toString();
    _baseToken.title = data.title[i];
    _baseToken.description = data.description[i];
    _baseToken.avatarID = parseInt(data.avatarID[i]);

    console.log(_baseToken);

    await _baseToken.save();
  }
}

async function handleModify(data) {
  // data structure:
  // {
  //     action: "modify",
  //     txHash: ["...", "..."],
  //     title: ["...", "..."],
  //     description: ["...", "..."],
  //     avatarID: ["...", "..."]
  // }

  for (var i = 0; i < data.title.length; i++) {
    let _baseToken = await BaseTokenModel.findById(data.txHash[i]).exec();

    // console.log(_baseToken);

    _baseToken.title = data.title[i];
    _baseToken.description = data.description[i];
    _baseToken.avatarID = parseInt(data.avatarID[i]);

    console.log(_baseToken);

    await _baseToken.save();
  }
}

server.listen(4004).then(({ url }) => {
  mongoose.set("useUnifiedTopology", true);
  mongoose.set("useNewUrlParser", true);
  //   mongoose.connect("mongodb://root:example@0.0.0.0:27017/local");
  mongoose.connect(
    `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_SERVER}:27017`
  );
  console.log(`🚀 Server ready at ${url}`);
});

async function natsConn() {
  try {
    nc = await connect({
      servers: [`${process.env.NATS}:4222`],
      payload: Payload.JSON,
    });

    nc.subscribe("local", (err, msg) => {
      if (err) {
      } else {
        let data = msg.data;
        switch (data.action) {
          case "mint":
            handleMint(data);
            break;
          case "modify":
            handleModify(data);
            break;
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
