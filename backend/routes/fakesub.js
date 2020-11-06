var express = require("express");
var router = express.Router();
const {provider, account, dai, factory} = require("../web3");
const {ethers} = require("ethers");

const SubscriptionV1 = require("../../client/src/contracts/SubscriptionV1.json");

router.route("/").post(async (req, res) => {
  try {
    publisher = req.body.publisher;

    const initAddress = await factory.getSubscription(publisher);

    if (initAddress === "0x0000000000000000000000000000000000000000") {
      return res
        .status(404)
        .json({error: "No contract deployed for publisher"});
    }

    var subscription = new ethers.Contract(
      initAddress,
      SubscriptionV1.abi,
      account
    );

    var initBal = await dai.balanceOf(account.address);

    initBal = initBal.toString();

    const valLength = parseInt(await subscription.acceptedValuesLength());

    var values = await subscription.acceptedValues(valLength - 1);

    values = values.toString();

    if (initBal < values) {
      await dai.mintTokens(account.address);
    }

    const allowance = parseInt(
      await dai.allowance(account.address, subscription.address)
    );

    if (allowance < values) {
      await dai.approve(subscription.address, values * "5");
    }

    if (parseInt(await subscription.allSubscribersLength()) === 1) {
      var hash = await subscription.getSubscriptionHash(
        account.address,
        values,
        dai.address,
        0,
        0
      );

      console.log(hash);

      const signedHash = await account.signMessage(ethers.utils.arrayify(hash));

      await subscription.createSubscription(
        account.address,
        values,
        dai.address,
        signedHash
      );
      return res.send("New Subscriber!");
    } else {
      return res.send("Subscriber Updated!");
    }
  } catch (error) {
    return res.status(400).json({error: error.toString()});
  }
});

module.exports = router;
