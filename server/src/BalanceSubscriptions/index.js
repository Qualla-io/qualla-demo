const {
  ApolloServer,
  PubSub,
  gql,
  withFilter,
} = require("apollo-server-express");
const { createServer } = require("http");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const { dai } = require("./utils");

const app = express();
const pubsub = new PubSub();

const DAI_BALANCE_UPDATED = "DAI_BALANCE_UPDATED";

const typeDefs = gql`
  type Subscription {
    daiBalance(id: ID!): Balance!
    daiAllowance(id: ID!, contractID: ID!): Balance!
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
    getBalance: async (_, { id }) => {
      let daibal = await dai.balanceOf(id);

      return { id, balance: daibal.toString() };
    },
  },
  Subscription: {
    daiBalance: {
      subscribe: withFilter(
        (_, { id }, context) => {
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
    // daiAllowance: {
    //   subscribe: withFilter(
    //     (_, { id, contractID }, context) => {
    //       let uuid = context.connection.context.uuid;

    //       allowanceDict[uuid].push(id);

    //       _subscribe_allowance(id, contractID);

    //       return pubsub.asyncIterator(DAI_ALLOWANCE_UPDATED);
    //     },
    //     (payload, variables) => {
    //       return (
    //         payload.daiAllowance.id.toLowerCase() === variables.id.toLowerCase()
    //       );
    //     }
    //   ),
    // },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    onConnect: (connectionParams, webSocket, context) => {
      const uuid = uuidv4();

      connectionDict[uuid] = [];

      // allowanceDict[uuid] = [];

      return {
        uuid: uuid,
      };
    },
    onDisconnect: (webSocket, context) => {
      context.initPromise.then((data) => {
        for (var i = 0; i < connectionDict.length; i++) {
          _unsubscribe(connectionDict[data.uuid][i]);
        }

        //   for (var i = 0; i < allowanceDict.length; i++) {
        //     _unsubscribe(allowanceDict[data.uuid][i]);
        //   }

        delete connectionDict[data.uuid];
        //   delete allowanceDict[data.uuid];
      });
    },
  },
});

server.applyMiddleware({ app });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 5000 }, () => {
  console.log("Apollo Server on http://localhost:5000/graphql");
});

let handleFromTransfer = async function (from, to, amount) {
  dai.balanceOf(from).then((daibal) => {
    // do stuff

    pubsub.publish(DAI_BALANCE_UPDATED, {
      daiBalance: { id: from, balance: daibal.toString() },
    });
  });
};

let handleToTransfer = async function (from, to, amount) {
  dai.balanceOf(to).then((daibal) => {
    // do stuff

    pubsub.publish(DAI_BALANCE_UPDATED, {
      daiBalance: { id: to, balance: daibal.toString() },
    });
  });
};

function _subscribe(id) {
  let filterFromMe = dai.filters.Transfer(id, null);

  let filterToMe = dai.filters.Transfer(null, id);

  dai.on(filterFromMe, handleFromTransfer);
  dai.on(filterToMe, handleToTransfer);

  dai.balanceOf(id).then((daibal) => {
    pubsub.publish(DAI_BALANCE_UPDATED, {
      daiBalance: { id, balance: daibal.toString() },
    });
  });
}

function _unsubscribe(id) {
  // Balances
  let filterFromMe = dai.filters.Transfer(id, null);

  let filterToMe = dai.filters.Transfer(null, id);

  dai.off(filterFromMe, handleFromTransfer);
  dai.off(filterToMe, handleToTransfer);
}
