import {ethers} from "ethers";
import Dai from "./abi/TestDai.json";
import Factory from "./abi/SubscriptionFactory.json";
import SubscriptionV1 from "./abi/SubscriptionV1.json";

const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URI);
const account = new ethers.Wallet(new Buffer.from(privateKey, "hex"), provider);
var dai = new ethers.Contract(
  Dai.networks[process.env.NETWORK_ID].address,
  Dai.abi,
  provider
);

dai = dai.connect(account);

var factory = new ethers.Contract(
  Factory.networks[process.env.NETWORK_ID].address,
  Factory.abi,
  provider
);
factory = factory.connect(account);

module.exports = {
  provider,
  account,
  dai,
  factory,
  SubscriptionV1,
};
