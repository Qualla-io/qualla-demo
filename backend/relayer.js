require("dotenv").config();
var mongoose = require("mongoose");
mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);
mongoose.connect("mongodb://root:example@localhost:27017");
const {ethers} = require("ethers");
const {provider, account, dai, factory} = require("./web3");
var Contract = require("./models/contract");
var Subscription = require("./models/subscription");

const SubscriptionV1 = require("../client/src/contracts/SubscriptionV1.json");

async function execSubs() {
  let query = Contract.find();
  Contract.find(async (err, contracts) => {
    for (var i = 0; i < contracts.length; i++) {
      let initAddress = contracts[i].address;
      let contract = contracts[i];
      var subscription = new ethers.Contract(
        initAddress,
        SubscriptionV1.abi,
        account
      );

      let subscribers = contract.subscribers;

      subscribers.forEach(async function (subscriber) {
        Subscription.findById(subscriber._id).exec(
          async (err, subscriberObj) => {
            if (
              subscriberObj.nextWithdrawl < Math.floor(Date.now() / 1000) &&
              subscriberObj.status === 0
            ) {
              Subscription.find({}).exec((err, subs) => [console.log(subs)]);
              let allowance = await dai.allowance(
                subscriberObj.subscriber,
                subscription.address
              );

              console.log(subscriberObj.subscriber);
              console.log(subscription.address);

              let balance = await dai.balanceOf(subscriberObj.subscriber);
              console.log(parseInt(balance));
              console.log(parseInt(allowance));
              if (
                allowance >= subscriberObj.value &&
                balance >= subscriberObj.value
              ) {
                console.log("calling");
                subscription
                  .executeSubscription(subscriberObj.hash)
                  .then(async () => {
                    subscriberObj.nextWithdrawl += 5;
                    await subscriberObj.save();
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              } else {
                console.log("not Calling");
                // console.log(contract)
                subscriberObj.status = 1;
                await subscriberObj.save();
              }
            }
          }
        );
      });
    }
  });
}

setInterval(execSubs, 5000);
