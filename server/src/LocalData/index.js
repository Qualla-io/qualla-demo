import {ApolloServer, gql} from "apollo-server";
import {buildFederatedSchema} from "@apollo/federation";

import UserModel from "../models/user";
import ContractModel from "../models/contract";

var mongoose = require("mongoose");

const typeDefs = gql`
  type Mutation {
    user(id: ID!, username: String): User
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    username: String
  }

  extend type Contract @key(fields: "id") {
    id: ID! @external
    tiers: [Tier!]
  }

  type Tier @key(fields: "id") {
    id: ID!
    value: Float
    title: String
    perks: String
  }
`;

const resolvers = {
  User: {
    username: async (user) => {
      let _user = await UserModel.findById(user.id).exec();
      return _user.username;
    },
  },
  Contract: {
    tiers: async (contract) => {
      let _contract = await ContractModel.findById(contract.id);
      return _contract.tiers;
    },
  },
  Mutation: {
    user: async (_, {id, username}) => {
      let _user = await UserModel.findById(id.toLowerCase()).exec();

      if (_user === null) {
        _user = await User.create({_id: id.toLowerCase()});
      }

      _user.username = username;
      await _user.save();

      return _user.toJSON();
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

server.listen(4004).then(({url}) => {
  mongoose.set("useUnifiedTopology", true);
  mongoose.set("useNewUrlParser", true);
  mongoose.connect("mongodb://root:example@localhost:27017");
  console.log(`🚀 Server ready at ${url}`);
});
