import {ApolloServer, gql} from "apollo-server";
import {buildFederatedSchema} from "@apollo/federation";

import UserModel from "./models/user";
import ContractModel from "./models/contract";
import TierModel from "./models/tier";

var mongoose = require("mongoose");

const typeDefs = gql`
  type Mutation {
    user(id: ID!, username: String): User
    modifyContractTiers(id: ID!, tiers: [TierInput!]!): [Tier]!
  }

  input TierInput {
    value: Float!
    perks: String!
    title: String!
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
      let _user = await UserModel.findById(user.id.toLowerCase());
      if (_user) {
        return _user.username;
      } else {
        return null;
      }
    },
  },
  Contract: {
    tiers: async (contract) => {
      let _contract = await ContractModel.findById(contract.id.toLowerCase());
      if (_contract && _contract.tiers) {
        return _contract.tiers;
      } else {
        return null;
      }
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
    modifyContractTiers: async (_, {id, tiers}) => {
      let _contract = await ContractModel.findById(id.toLowerCase());

      if (_contract === null) {
        _contract = new ContractModel();
      }

      _contract._id = id.toLowerCase();
      _contract.set("tiers", []);

      let tier;
      for (var j = 0; j < tiers.length; j++) {
        tier = new TierModel();
        tier.id = mongoose.Types.ObjectId();
        tier.title = tiers[j].title;
        tier.value = tiers[j].value;
        tier.perks = tiers[j].perks;
        tier.save();
        _contract.tiers.push(tier);
      }

      await _contract.save();

      return _contract.tiers;
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
  //   mongoose.connect("mongodb://root:example@0.0.0.0:27017/local");
  mongoose.connect("mongodb://root:example@mongo:27017");
  console.log(`🚀 Server ready at ${url}`);
});
