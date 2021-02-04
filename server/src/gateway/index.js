const { ApolloServer } = require("apollo-server");
const { ApolloGateway } = require("@apollo/gateway");

const serviceList = [
  { name: "User", url: `http://${process.env.USER_DATA}:4001` },
  // {
  //   name: "BlockchainBaseToken",
  //   url: `http://${process.env.TIERTOKEN_DATA}:4002`,
  // },
  // {
  //   name: "BlockchainSubToken",
  //   url: `http://${process.env.BEAMTOKEN_DATA}:4003`,
  // },
  // { name: "Local", url: `http://${process.env.LOCAL_DATA}:4004` },
];

const gateway = new ApolloGateway({
  serviceList,
});

(async () => {
  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({
    schema,
    executor,
    subscriptions: false,
  });

  server.listen(4000).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();
