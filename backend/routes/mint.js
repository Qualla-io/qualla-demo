var express = require("express");
var router = express.Router();
require("dotenv").config();
const {provider, acount, dai} = require("../web3");

router.route("/").post(async (req, res) => {
  const user = req.body.account;

  const initBal = await dai.balanceOf(user);
  console.log(`Old balance: ${initBal}`);

  if (initBal < 3000000000000000000000) {
    await dai.mintTokens(user);
    res.status(200);
  } else {
    return res.status(400).json({error: "Excess Funds. Don't be greedy!"});
  }

  const finalBal = await dai.balanceOf(user);
  console.log(`New balance: ${finalBal}`);

  return res.send(`New Funds: ${finalBal}`);
});

module.exports = router;
