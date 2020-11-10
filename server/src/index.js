// const express = require("express");
// const {ApolloServer, gql} = require("apollo-server");
// require("./config");

// // Models
// const Contract = require("./models/contract");
// const User = require("./models/user");
// const Tier = require("./models/tier");

// // Schema
// const schemas = require("./schemas");
// const resolvers = require("./resolvers")

// const typeDefs = gql`
//   type Contract {
//     id: ID!
//     publisher: User
//     subscribers: [User]
//     tiers: [Tier]
//   }
//   type User {
//     address: ID!
//     username: String
//   }
//   type Tier {
//     id: ID!
//     perks: String
//     title: String
//     value: String
//   }
//   type Query {
//     contracts: [Contract]
//     users: [User]
//     tiers: [Tier]
//   }
//   type Mutation {
//     contract(id: String!, publisher: String!): Contract
//   }
// `;

// const resolvers = {
//   Query: {
//     contracts: async () => await Contract.find({}).exec(),
//     users: async () => await User.find({}).exec(),
//     tiers: async () => await Tier.find({}).exec(),
//   },
//   Mutation: {
//     contract: async (_, args) => {
//       try {
//         let contract = await Contract.findById(args.id);
//         if (contract) {
//         }
//         contract = new Contract();
//         contract._id = args.id;
//         let publisher = await User.findById(args.publisher);
//         if (publisher === null) {
//           await Publisher.create({_id: args.publisher});
//         }
//         contract.publisher = args.publisher;
//         await contract.save();
//         return contract;
//       } catch (err) {
//         return err.message;
//       }
//     },
//   },
// };

// const server = new ApolloServer({typeDefs: schemas, resolvers});
// // const app = express();
// // server.applyMiddleware({app});
// const PORT = process.env.PORT || 6000;

// server.listen().then(({url}) => {
//   console.log(`Server ready at ${url}`);
// });

import cors from "cors";
import express from "express";
import {ApolloServer} from "apollo-server-express";
var mongoose = require("mongoose");

import schemas from "./schemas";
import resolvers from "./resolvers";

const app = express();
app.use(cors());

const server = new ApolloServer({
  typeDefs: schemas,
  resolvers,
});

server.applyMiddleware({app, path: "/graphql"});

app.listen(4000, () => {
  mongoose.set("useUnifiedTopology", true);
  mongoose.set("useNewUrlParser", true);
  mongoose.connect("mongodb://root:example@localhost:27017");
});
