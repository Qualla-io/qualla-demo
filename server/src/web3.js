import {ethers} from "ethers";
import dotenv from "dotenv";
dotenv.config();

import Dai from "../../client/src/contracts/TestDai.json";
import Factory from "../../client/src/contracts/SubscriptionFactory.json";
import SubscriptionV1 from "../../client/src/contracts/SubscriptionV1.json";


const privateKey = process.env.PRIVATE_KEY;

const provider = new ethers.providers.JsonRpcProvider();
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
  SubscriptionV1
};