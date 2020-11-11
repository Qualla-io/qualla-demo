const {ApolloServer} = require("apollo-server");
const {ApolloGateway} = require("@apollo/gateway");

const gateway = new ApolloGateway({
  serviceList: [
    {name: "local", url: "http://localhost:4001"},
    {
      name: "blockchain",
      url: "http://localhost:8000/subgraphs/name/ghardin1314/qualla-demoV1",
    },
  ],
});

const server = new ApolloServer({
  gateway,
  // Disable subscriptions (not currently supported with ApolloGateway)
  subscriptions: false,
});

server.listen(4002).then(({url}) => {
  console.log(`🚀 Server ready at ${url}`);
});
