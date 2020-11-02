var TestDai = artifacts.require("./TestDai.sol");

module.exports = function (deployer) {
  deployer.deploy(TestDai, 5777);
};
