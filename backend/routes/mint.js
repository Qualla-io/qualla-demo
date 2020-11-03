var express = require("express");
var router = express.Router();
require("dotenv").config();
const {provider, acount, dai} = require("../web3");

router.route("/").post(async (req, res) => {
  const user = req.body.account;
  console.log(`Old balance: ${await dai.balanceOf(user)}`);

  await dai.mintTokens(user);

  console.log(`New balance: ${await dai.balanceOf(user)}`);
});

module.exports = router;
