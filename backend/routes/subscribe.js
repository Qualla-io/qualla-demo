var express = require("express");
var router = express.Router();
const {ethers} = require("ethers");
var Contract = require("../models/contract");
var Subscription = require("../models/subscription");
require("dotenv").config();
const {provider, acount, dai, factory, account} = require("../web3");

const SubscriptionV1 = require("../../client/src/contracts/SubscriptionV1.json");

router.route("/").post(async (req, res) => {
  let contractAddress = req.body.contract;
  let subscriber = req.body.account;
  let hash = req.body.hash;
  let signedHash = req.body.signedHash;
  let value = req.body.value;

  var subscription = new ethers.Contract(
    contractAddress,
    SubscriptionV1.abi,
    account
  );

  console.log(`Old subs count: ${await subscription.allSubscribersLength()}`);

  try {
    await subscription.createSubscription(
      subscriber,
      value,
      dai.address,
      signedHash
    );

    console.log(
      `New subs count: ${await await subscription.allSubscribersLength()}`
    );

    Contract.findById(contractAddress).exec(async (err, contract) => {
      if (err) res.send(err);

      let _subscription = new Subscription();
      _subscription.subscriber = subscriber;
      _subscription.value = value;
      _subscription.token = dai.address;
      _subscription.status = 0;
      _subscription.hash = hash;
      _subscription.signedHash = signedHash;
      _subscription.nextWithdrawl = Math.floor(Date.now() / 1000);
      _subscription.contract = subscription.address;

      contract.subscribers.push(_subscription);
      await _subscription.save();
      await contract.save();

      return res.send("New Subscriber!");
    });
  } catch (err) {
    return res.status(400).send();
  }
});

module.exports = router;
