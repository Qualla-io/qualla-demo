const {
  ApolloServer,
  PubSub,
  gql,
  withFilter,
} = require("apollo-server-express");
const {createServer} = require("http");
const express = require("express");
const {v4: uuidv4} = require("uuid");

const {dai} = require("./utils");

const app = express();
const pubsub = new PubSub();

const DAI_BALANCE_UPDATED = "DAI_BALANCE_UPDATED";

const typeDefs = gql`
  type Subscription {
    daiBalance(id: ID!): Balance!
  }

  type Query {
    getBalance(id: ID!): Balance!
  }

  type Balance {
    id: String!
    balance: String!
  }
`;

let connectionDict = {};

const resolvers = {
  Query: {
    getBalance: async (_, {id}) => {
      let daibal = await dai.balanceOf(id);

      return {id, balance: daibal.toString()};
    },
  },
  Subscription: {
    daiBalance: {
      subscribe: withFilter(
        (_, {id}, context) => {
          let uuid = context.connection.context.uuid;

          connectionDict[uuid].push(id);

          _subscribe(id);

          return pubsub.asyncIterator(DAI_BALANCE_UPDATED);
        },
        (payload, variables) => {
          return (
            payload.daiBalance.id.toLowerCase() === variables.id.toLowerCase()
          );
        }
      ),
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    onConnect: (connectionParams, webSocket, context) => {
      uuid = uuidv4();

      connectionDict[uuid] = [];

      return {
        uuid: uuid,
      };
    },
    onDisconnect: (webSocket, context) => {
      context.initPromise.then((data) => {
        for (var i = 0; i < connectionDict.length; i++) {
          _unsubscribe(connectionDict[data.uuid][i]);
        }

        delete connectionDict[data.uuid];
      });
    },
  },
});

server.applyMiddleware({app});

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({port: 5000}, () => {
  console.log("Apollo Server on http://localhost:5000/graphql");
});

let handleFromTransfer = async function (from, to, amount) {
  dai.balanceOf(from).then((daibal) => {
    // do stuff

    pubsub.publish(DAI_BALANCE_UPDATED, {
      daiBalance: {id: from, balance: daibal.toString()},
    });
  });
};

let handleToTransfer = async function (from, to, amount) {
  dai.balanceOf(to).then((daibal) => {
    // do stuff

    pubsub.publish(DAI_BALANCE_UPDATED, {
      daiBalance: {id: to, balance: daibal.toString()},
    });
  });
};

function _subscribe(id) {
  let filterFromMe = dai.filters.Transfer(id, null);

  let filterToMe = dai.filters.Transfer(null, id);

  dai.on(filterFromMe, handleFromTransfer);
  dai.on(filterToMe, handleToTransfer);
}

function _unsubscribe(id) {
  let filterFromMe = dai.filters.Transfer(id, null);

  let filterToMe = dai.filters.Transfer(null, id);

  dai.off(filterFromMe, handleFromTransfer);
  dai.off(filterToMe, handleToTransfer);
}
