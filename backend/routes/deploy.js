var express = require("express");
var router = express.Router();
const {ethers} = require("ethers");
var Contract = require("../models/contract");
var Publisher = require("../models/publisher");
var Tier = require("../models/tier");
require("dotenv").config();
const {provider, acount, dai, factory, account} = require("../web3");

const SubscriptionV1 = require("../../client/src/contracts/SubscriptionV1.json");

router.route("/").post(async (req, res) => {
  const tiers = req.body.tiers;
  const publisher = req.body.publisher;
  const daiAddress = [dai.address];

  let values = [];

  for (var i = 0; i < tiers.length; i++) {
    values.push(tiers[i].value);
  }

  const initAddress = await factory.getSubscription(publisher);

  if (initAddress !== "0x0000000000000000000000000000000000000000") {
    // update fields
    var subscription = new ethers.Contract(
      initAddress,
      SubscriptionV1.abi,
      account
    );

    // Add in this functionality
  } else {
    try {
      // Create new contract
      await factory.createSubscription(publisher, daiAddress, values);
      var address = await factory.getSubscription(publisher);

      // Save title and perks in database
      var contract = new Contract();
      contract._id = address;
      contract.publisher = publisher;

      var _publisher = await Publisher.find({_id: publisher}).exec();
      if (_publisher.length === 0) {
        try {
          await Publisher.create({_id: publisher});
        } catch (error) {
          return resSend.status(400).json({error: error.toString()});
        }
        console.log("created publisher");
      }

      let tier;
      for (var i = 0; i < tiers.length; i++) {
        tier = new Tier();
        tier.title = tiers[i].title;
        tier.value = tiers[i].value;
        tier.perks = tiers[i].perks;

        contract.tiers.push(tier);
      }

      try {
        console.log(contract);
        await contract.save();
      } catch (error) {
        console.log("failed");
        return resSend.status(400).json({error: error.toString()});
      }

      res.send(address);
    } catch (err) {
      console.log(err.body);
      res.status(400).json({error: "Error deploying or updating contract"});
    }
  }
});

module.exports = router;
