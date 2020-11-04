const {ethers} = require("ethers");
require("dotenv").config();

const Dai = require("../client/src/contracts/TestDai.json");
const Factory = require("../client/src/contracts/SubscriptionFactory.json");

const privateKey = process.env.PRIVATE_KEY;

const provider = new ethers.providers.JsonRpcProvider();
const account = new ethers.Wallet(new Buffer.from(privateKey, "hex"), provider);
var dai = new ethers.Contract(Dai.networks[process.env.NETWORK_ID].address, Dai.abi, provider);
dai = dai.connect(account);

var factory = new ethers.Contract(
  Factory.networks[process.env.NETWORK_ID].address,
  Factory.abi,
  provider
);
factory = factory.connect(account)

module.exports = {
  provider,
  account,
  dai,
  factory,
};
