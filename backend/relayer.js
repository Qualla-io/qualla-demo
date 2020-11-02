const fs = require("fs");
require("dotenv").config();
var mongoose = require("mongoose");
const Web3 = require("web3");
mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);
mongoose.connect("mongodb://root:example@localhost:27017");

const contract = JSON.parse(
  fs.readFileSync("../client/src/contracts/Subscription.json")
);
const abi = JSON.stringify(contract.abi);
const account = process.env.ACCOUNT;
const privateKey = process.env.PRIVATE_KEY;

var Contract = require("./models/contract");
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

async function execSubs() {
  console.log("working");
  Contract.find(async (err, contracts) => {
    for (var i = 0; i < contracts.length; i++) {
      let address = contracts[i].address;
      var instance = new web3.eth.Contract(contract.abi, address);
      var subNumber = await instance.methods.getSubscriberListLength().call();
      console.log(subNumber)
      for (var j = 1; j < subNumber; j++) {
        sub = await instance.methods.SubscriptionList(j).call();
        console.log(sub.nextWithdraw)
        const now = Math.floor(Date.now() / 1000)
        console.log(now)
        if (sub.status === "0" && sub.nextWithdraw < now) {
          var hash = await instance.methods
            .getSubscriptionHash(
              sub.subscriber,
              sub.value,
              sub.data,
              0,
              sub.txGas,
              sub.dataGas,
              sub.gasPrice,
              sub.gasToken,
              sub.meta
            )
            .call();

          const tx = instance.methods.executeFromHash(hash);
          const gas = await tx.estimateGas({ from: account });
          const gasPrice = await web3.eth.getGasPrice();
          const data = tx.encodeABI();
          const nonce = await web3.eth.getTransactionCount(account, "pending");
          const signedTx = await web3.eth.accounts.signTransaction(
            {
              to: address,
              from: account,
              data,
              gas,
              gasPrice,
              nonce,
              chainId: 5777,
            },
            privateKey
          );

          web3.eth
            .sendSignedTransaction(signedTx.rawTransaction)
            .then((res) => {
              console.log("Transfered");
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
    }
  });
}

module.exports = { execSubs };
