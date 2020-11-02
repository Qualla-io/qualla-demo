var express = require("express");
var router = express.Router();
const Web3 = require("web3");
const fs = require("fs");
require("dotenv").config();

const contract = JSON.parse(
  fs.readFileSync("../client/src/contracts/TestDai.json")
);

const myAddress = process.env.ACCOUNT;
const privateKey = process.env.PRIVATE_KEY;

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
// web3.eth.net
//   .getId()
//   .then((res) => {
//     const networkId = res;
//     const deployedNetwork = ShitCoin.networks[networkId];
//     instance = new web3.eth.Contract(
//       ShitCoin.abi,
//       deployedNetwork && deployedNetwork.address
//     );
//   })
//   .catch(console.log);

router.route("/").post(async (req, res) => {
  var instance = new web3.eth.Contract(contract.abi, req.body.coin);

  const result = req.body.res;
  const message = req.body.message;
  const account = req.body.account;
  const subscription = req.body.contract;

  const tx = instance.methods.permit(
    account,
    subscription,
    message.nonce,
    message.expiry,
    message.allowed,
    result.v,
    result.r,
    result.s
  );
  //   console.log(tx);
  const gas = await tx.estimateGas({ from: myAddress });
  const gasPrice = await web3.eth.getGasPrice();
  const data = tx.encodeABI();
  var nonce = await web3.eth.getTransactionCount(myAddress, "pending");
  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: instance._address,
      from: myAddress,
      data,
      gas,
      gasPrice,
      nonce,
      chainId: 5777,
    },
    privateKey
  );

  console.log(
    `Old approval: ${await instance.methods.allowance(account, subscription).call()}`
  );
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  console.log(
    `New approval: ${await instance.methods.allowance(account, subscription).call()}`
  );
});

module.exports = router;
