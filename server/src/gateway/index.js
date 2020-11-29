const {ApolloServer} = require("apollo-server");
const {ApolloGateway} = require("@apollo/gateway");

const serviceList = [
  {name: "BlockchainUser", url: "http://blockchain_user:4001"},
  {name: "BlockchainContract", url: "http://blockchain_contract:4002"},
  {name: "BlockchainSubscription", url: "http://blockchain_subscription:4003"},
  {name: "Local", url: "http://local_data:4004"},
];

const gateway = new ApolloGateway({
  serviceList,
});

(async () => {
  const {schema, executor} = await gateway.load();

  const server = new ApolloServer({
    schema,
    executor,
    subscriptions: false,
  });

  server.listen(4000).then(({url}) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();

// const server = new ApolloServer({gateway, subscriptions: false});

// server.listen(5000, () => {
//   //   mongoose.set("useUnifiedTopology", true);
//   //   mongoose.set("useNewUrlParser", true);
//   //   mongoose.connect("mongodb://root:example@localhost:27017");
// });
