import cors from "cors";
import express from "express";
import {ApolloServer} from "apollo-server-express";
var mongoose = require("mongoose");

import schemas from "./schemas";
import resolvers from "./resolvers";
import GraphAPI from "./datasources/graphProtocol";
import LocalAPI from "./datasources/localData";

const app = express();
app.use(cors());

const dataSources = () => ({
  graphAPI: new GraphAPI(),
  localAPI: new LocalAPI(),
});

const server = new ApolloServer({
  typeDefs: schemas,
  resolvers,
  dataSources,
});

server.applyMiddleware({app, path: "/graphql"});

app.listen(4000, () => {
  mongoose.set("useUnifiedTopology", true);
  mongoose.set("useNewUrlParser", true);
  mongoose.connect("mongodb://root:example@localhost:27017");
});
