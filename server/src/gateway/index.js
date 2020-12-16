const { ApolloServer } = require("apollo-server");
const { ApolloGateway } = require("@apollo/gateway");

const serviceList = [
  { name: "BlockchainUser", url: "http://blockchain_user:4001" },
  { name: "BlockchainBaseToken", url: "http://blockchain_basetoken:4002" },
  { name: "BlockchainSubToken", url: "http://blockchain_subtoken:4003" },
  // {name: "Local", url: "http://local_data:4004"},
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
