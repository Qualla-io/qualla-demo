const {ethers} = require("ethers");
require("dotenv").config();

const Dai = require("../client/src/contracts/TestDai.json");

const privateKey = process.env.PRIVATE_KEY;

const provider = new ethers.providers.JsonRpcProvider();
const account = new ethers.Wallet(new Buffer.from(privateKey, "hex"), provider);
var dai = new ethers.Contract(Dai.networks[5777].address, Dai.abi, provider);
dai = dai.connect(account);

module.exports = {
  provider,
  account,
  dai,
};
