import { ethers } from "ethers";
import Dai from "./abi/TestDai.json";
import SubscriptionV1 from "./abi/SubscriptionV1.json";

const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URI);
const account = new ethers.Wallet(new Buffer.from(privateKey, "hex"), provider);
var dai = new ethers.Contract(process.env.DAI_CONTRACT, Dai.abi, provider);

dai = dai.connect(account);

var subscriptionV1 = new ethers.Contract(
  process.env.SUB_CONTRACT,
  SubscriptionV1.abi,
  provider
);
subscriptionV1 = subscriptionV1.connect(account);

module.exports = {
  provider,
  account,
  dai,
  subscriptionV1,
};
