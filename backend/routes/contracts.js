var express = require("express");
var Contract = require("../models/contract");
var Publisher = require("../models/publisher");
var router = express.Router();

router
  .route("/")

  .post(async (req, resSend) => {
    var contract = new Contract();
    contract._id = req.body.address;
    contract.publisher = req.body.publisher;

    var publisher = await Publisher.find({ _id: req.body.publisher }).exec();

    if ((publisher.length === 0)) {
      try {
        await Publisher.create({ _id: req.body.publisher });
      } catch (error) {
        return resSend.status(400).json({ error: error.toString() });
      }
      console.log("created publisher");
    }

    try {
      await contract.save();
    } catch (error) {
      return resSend.status(400).json({ error: error.toString() });
    }

    resSend.json({ message: "Contract Saved!" });
    //   return;
  })

  .get(function (req, res) {
    Contract.find(function (err, contracts) {
      if (err) res.send(err);

      res.json(contracts);
    });
  });

// Single contract

router
  .route("/:contract_address")

  .get(function (req, res) {
    Contract.findById(req.params.contract_address, function (err, contract) {
      if (err) res.send(err);
      res.json(contract);
    });
  })

  .delete(function (req, res) {
    Contract.deleteOne(
      {
        _id: req.params.contract_address,
      },
      function (err, contract) {
        if (err) res.send(err);

        res.json({ message: "Deleted Successfully" });
      }
    );
  });

module.exports = router;
