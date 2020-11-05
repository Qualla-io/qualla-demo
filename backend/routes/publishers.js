var express = require("express");
var Publisher = require("../models/publisher");
var Contract = require("../models/contract");
var Tier = require("../models/tier");
var router = express.Router();
const {provider, acount, dai, factory, account} = require("../web3");
const {ethers} = require("ethers");

const SubscriptionV1 = require("../../client/src/contracts/SubscriptionV1.json");

router
  .route("/")

  .post(function (req, res) {
    console.log(res.body);
    var publisher = new Publisher();
    publisher._id = req.body.address;
    publisher.username = req.body.username;

    publisher.save(function (err) {
      if (err) {
        console.log(err);
        res.send(err);
        return;
      }
      res.json({message: "Publisher Saved!"});
    });
  })

  .get(function (req, res) {
    Publisher.find(function (err, publishers) {
      if (err) res.send(err);

      res.json(publishers);
    });
  });

router
  .route("/:publisher_address")

  .get(function (req, res) {
    Publisher.findById(req.params.publisher_address, function (err, publisher) {
      if (err) res.send(err);
      res.json(publisher);
    });
  })

  .delete(function (req, res) {
    Publisher.deleteOne(
      {
        _id: req.params.publisher_address,
      },
      function (err, publisher) {
        if (err) res.send(err);

        res.json({message: "Deleted Successfully"});
      }
    );
  });

router
  .route("/:publisher_address/contract")
  .get(async (req, res) => {
    const initAddress = await factory.getSubscription(
      req.params.publisher_address
    );
    let subscriberCount = 0;

    if (initAddress !== "0x0000000000000000000000000000000000000000") {
      var subscription = new ethers.Contract(
        initAddress,
        SubscriptionV1.abi,
        account
      );

      subscriberCount = parseInt(await subscription.allSubscribersLength());
    }

    Contract.findById(initAddress).exec((err, contract) => {
      if (err) res.send(err);
      if (initAddress !== "0x0000000000000000000000000000000000000000") {
        contract.set("subscriberCount", subscriberCount - 1, {strict: false});
      }
      res.json(contract);
    });
  })
  .post(async (req, res) => {
    const initAddress = await factory.getSubscription(req.body.publisher);

    if (initAddress !== "0x0000000000000000000000000000000000000000") {
      var subscription = new ethers.Contract(
        initAddress,
        SubscriptionV1.abi,
        account
      );

      const signature = req.body.signature;
      const tiers = req.body.tiers;

      const values = req.body.values;

      console.log(values);
      console.log(signature);

      subscription
        .modifyContract([dai.address], values, signature)
        .then(async (ans) => {
          Contract.findById(initAddress).exec(async (err, contract) => {
            contract.set("tiers", []);

            let tier;
            for (var i = 0; i < tiers.length; i++) {
              tier = new Tier();
              tier.title = tiers[i].title;
              tier.value = tiers[i].value;
              tier.perks = tiers[i].perks;

              contract.tiers.push(tier);
            }

            console.log(contract);
            try {
              await contract.save();
            } catch (error) {
              return res.status(400).json({error: error.toString()});
            }
          });
        })
        .catch((err) => {
          console.log("err");
        });
    } else {
      return res
        .status(404)
        .json({error: "No contract deployed for publisher"});
    }
  });

module.exports = router;
