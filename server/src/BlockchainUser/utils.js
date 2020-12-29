import {ethers} from "ethers";
import Dai from "./abi/TestDai.json";


const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URI);
const account = new ethers.Wallet(privateKey, provider);
var dai = new ethers.Contract(
  process.env.DAI_CONTRACT,
  Dai.abi,
  provider
);

dai = dai.connect(account);

module.exports = {
  provider,
  account,
  dai,
};