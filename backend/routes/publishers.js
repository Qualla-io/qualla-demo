var express = require("express");
var Publisher = require("../models/publisher");
var Contract = require("../models/contract");
var router = express.Router();
const {provider, acount, dai, factory, account} = require("../web3");

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

router.route("/:publisher_address/contract").get(async (req, res) => {
  const initAddress = await factory.getSubscription(
    req.params.publisher_address
  );

  console.log(initAddress);

  // Contract.findOne({}, function (err, contract) {
  //   console.log(contract[2].address === initAddress);
  // });

  Contract.findById(initAddress).exec((err, contract) => {
    if (err) res.send(err);
    res.json(contract);
  });

  // Contract.find({address: initAddress}, function (err, contract) {
  //   console.log(contract);
  //   if (err) res.send(err);
  //   res.json(contract);
});

module.exports = router;
