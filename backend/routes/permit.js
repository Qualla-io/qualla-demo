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

  const preApproval = await dai.allowance(account, subscription);

  console.log(`Old approval: ${preApproval}`);
  console.log(preApproval);
  if (
    preApproval.toString() ===
    "115792089237316195423570985008687907853269984665640564039457584007913129639935"
  ) {
    return res.send("Already Permitted");
  }

  try {
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
    return res.send("Successful Permit");
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
});

module.exports = router;
