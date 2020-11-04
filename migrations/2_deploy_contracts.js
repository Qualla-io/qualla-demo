var TestDai = artifacts.require("./TestDai.sol");
var SubscriptionFactory = artifacts.require("./SubscriptionFactory.sol");

module.exports = function (deployer) {
  deployer.deploy(TestDai, 5777);
  deployer.deploy(SubscriptionFactory, 5);
};
