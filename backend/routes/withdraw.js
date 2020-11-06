var express = require("express");
var router = express.Router();
const {ethers} = require("ethers");

const {provider, acount, dai, factory, account} = require("../web3");
const SubscriptionV1 = require("../../client/src/contracts/SubscriptionV1.json");

router.route("/").post(async (req, res) => {
  const publisher = req.body.publisher;
  const initAddress = await factory.getSubscription(req.body.publisher);
  if (initAddress !== "0x0000000000000000000000000000000000000000") {
    var subscription = new ethers.Contract(
      initAddress,
      SubscriptionV1.abi,
      account
    );
      
    await subscription.withdraw();
  } else {
    return res.status(404).json({error: "No contract deployed for publisher"});
  }
});

module.exports = router;
