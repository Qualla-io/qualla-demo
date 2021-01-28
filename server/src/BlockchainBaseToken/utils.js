import { ethers } from "ethers";
import Dai from "./abi/TestDai.json";
import Qualla from "./abi/Qualla.json";

let privateKey = process.env.PRIVATE_KEY;
let provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URI);
const account = new ethers.Wallet(privateKey, provider);
let signer = new ethers.Wallet(privateKey);
let dai = new ethers.Contract(process.env.DAI_CONTRACT, Dai.abi, provider);

dai = dai.connect(account);

var qualla = new ethers.Contract(
  process.env.SUB_CONTRACT,
  Qualla.abi,
  provider
);

qualla = qualla.connect(account);

module.exports = {
  provider,
  account,
  dai,
  qualla,
  signer,
};
