var express = require("express");
var router = express.Router();
const Web3 = require("web3");
const fs = require("fs");
require("dotenv").config();

const contract = JSON.parse(
  fs.readFileSync("../client/src/contracts/Subscription.json")
);
const abi = JSON.stringify(contract.abi);
const bytecode = contract.bytecode;
const address = process.env.ACCOUNT;
const privateKey = process.env.PRIVATE_KEY;

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

router.route("/").post(async (req, res) => {
  const args = req.body.args;
  var instance = new web3.eth.Contract(contract.abi);
  const tx = instance.deploy({
    data: bytecode,
    arguments: [args[0], address, args[1], args[2], args[3]],
  });
  const gas = await tx.estimateGas({ from: address });
  const gasPrice = await web3.eth.getGasPrice();
  const data = tx.encodeABI();
  const nonce = await web3.eth.getTransactionCount(address, "pending");
  const signedTx = await web3.eth.accounts.signTransaction(
    {
      from: address,
      data,
      gas,
      gasPrice,
      nonce,
      chainId: 5777,
    },
    privateKey
  );

  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  res.send(receipt.contractAddress);
});

module.exports = router;
