var express = require("express");
var router = express.Router();
const Web3 = require("web3");
const fs = require("fs");
require("dotenv").config();

const Dai = require("../../client/src/contracts/TestDai.json");

const address = process.env.ACCOUNT;
const privateKey = process.env.PRIVATE_KEY;
var instance = null;

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.eth.net
  .getId()
  .then((res) => {
    const networkId = res;
    const deployedNetwork = Dai.networks[networkId];
    instance = new web3.eth.Contract(
      Dai.abi,
      deployedNetwork && deployedNetwork.address
    );
  })
  .catch(console.log);

router.route("/").post(async (req, res) => {
  //   var instance = new web3.eth.Contract(contract.abi, req.body.coin);
  const user = req.body.account;
  const tx = instance.methods.mintTokens(user);
  const gas = await tx.estimateGas({ from: address });
  const gasPrice = await web3.eth.getGasPrice();
  const data = tx.encodeABI();
  const nonce = await web3.eth.getTransactionCount(address, "pending");

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: instance._address,
      from: address,
      data,
      gas,
      gasPrice,
      nonce,
      chainId: 5777,
    },
    privateKey
  );

  console.log(`Old balance: ${await instance.methods.balanceOf(user).call()}`);

  // const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  var ress = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  console.log(`New balance: ${await instance.methods.balanceOf(user).call()}`);
});

module.exports = router;
