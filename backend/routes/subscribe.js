var express = require("express");
var router = express.Router();
const Web3 = require("web3");
const fs = require("fs");
require("dotenv").config();

const contract = JSON.parse(
  fs.readFileSync("../client/src/contracts/Subscription.json")
);
const abi = JSON.stringify(contract.abi);
const address = process.env.ACCOUNT;
const privateKey = process.env.PRIVATE_KEY;


let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

router.route("/").post(async (req, res) => {
  var args = req.body.data;

  var instance = new web3.eth.Contract(contract.abi, req.body.contract);

  const tx = instance.methods.executeSubscription(
    args[0],
    args[1],
    args[2],
    args[3],
    args[4],
    args[5],
    args[6],
    args[7],
    args[8],
    req.body.hash
  );

  const gas = await tx.estimateGas({ from: address });
  const gasPrice = await web3.eth.getGasPrice();
  const data = tx.encodeABI();
  const nonce = await web3.eth.getTransactionCount(address, "pending");

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: req.body.contract,
      from: address,
      data,
      gas,
      gasPrice,
      nonce,
      chainId: 5777,
    },
    privateKey
  );

  console.log(
    `Old subs count: ${await instance.methods.getSubscriberListLength().call()}`
  );

  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  //   web3.eth
  //     .sendSignedTransaction(signedTx.rawTransaction)
  //     .then((res) => {console.log(`Transaction hash: ${res.transactionHash}`);})
  //     .catch((err) => {
  //       console.log(err);
  //     });

  console.log(`Transaction hash: ${receipt}`);

  const logs = await instance.getPastEvents("allEvents", {
    fromBlock: receipt.blockNumber,
    toBlock: receipt.blockNumber,
  });

  console.log(logs);

  console.log(
    `New subs count: ${await instance.methods.getSubscriberListLength().call()}`
  );
});

module.exports = router;
