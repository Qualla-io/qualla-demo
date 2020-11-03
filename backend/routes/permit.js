var express = require("express");
var router = express.Router();
const Web3 = require("web3");
const fs = require("fs");
require("dotenv").config();
const {provider, acount, dai} = require("../web3");

router.route("/").post(async (req, res) => {
  const result = req.body.res;
  const message = req.body.message;
  const account = req.body.account;
  const subscription = req.body.contract;

  console.log(`Old approval: ${await dai.allowance(account, subscription)}`);
  const receipt = await dai.permit(
    account,
    subscription,
    message.nonce,
    message.expiry,
    message.allowed,
    result.v,
    result.r,
    result.s
  );

  console.log(`New approval: ${await dai.allowance(account, subscription)}`);
});

module.exports = router;
