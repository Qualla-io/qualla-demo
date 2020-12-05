const ethers = require("ethers");
// const Dai = require { "./abi/TestDai.json"}
const Dai = require("./abi/TestDai.json");

const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URI);
const account = new ethers.Wallet(new Buffer.from(privateKey, "hex"), provider);
var dai = new ethers.Contract(
  Dai.networks[process.env.NETWORK_ID].address,
  Dai.abi,
  provider
);

dai = dai.connect(account);

module.exports = {
  provider,
  account,
  dai,
};


