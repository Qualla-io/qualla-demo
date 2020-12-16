var TestDai = artifacts.require("./TestDai.sol");
var SubscriptionV1 = artifacts.require("./SubscriptionV1.sol");

module.exports = function (deployer) {
  deployer.deploy(TestDai, 1337);
  deployer.deploy(SubscriptionV1);
};
