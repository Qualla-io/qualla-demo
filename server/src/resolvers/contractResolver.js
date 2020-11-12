import Contract from "../models/contract";
import User from "../models/user";
import Tier from "../models/tier";
import {UserInputError} from "apollo-server";
import {ethers} from "ethers";
import {getContract, getContracts} from "../datasources/contractData";
import {provider, acount, dai, factory, account, SubscriptionV1} from "../web3";
import merge from "lodash.merge";
import mongoose from "mongoose";
import {getContractById, getUserById} from "./helpers";

const resolver = {
  Query: {
    contracts: async () => {
      // Pull from graph protocol
      let contracts = await getContracts();
      let ids = contracts.map(({id}) => id);

      // Pull from local data
      let _contracts = await Contract.find().where("_id").in(ids).lean();
      // .populate("publisher");

      // Stitch
      contracts = merge(_contracts, contracts);

      return contracts;
    },
    contract: async (_, args) => {
      // finds contract by address of publisher

      let contract = getContractById(args.id);

      return contract;
    },
  },
  Contract: {
    publisher: async(parent) => {
      return getUserById(parent.publisher.id)
    }
  },
  Mutation: {
    modifyContract: async (_, args) => {
      // this works besides the actual on chain modification.
      // TODO: Test with front end

      // Check if user has contract

      let contract = await getContract(args.publisher.toLowerCase());

      if (!contract) {
        throw new UserInputError("User does not have active contract", {
          invalidArgs: Object.keys(args),
        });
      }

      let _contract = await Contract.findById(contract.id.toLowerCase())
        .populate("publisher")
        .exec();

      var subscriptionV1 = new ethers.Contract(
        contract.id,
        SubscriptionV1.abi,
        account
      );

      let values = [];
      for (var i = 0; i < args.tiers.length; i++) {
        values.push(
          ethers.constants.WeiPerEther.mul(args.tiers[i].value).toString()
        );
      }

      try {
        await subscriptionV1.modifyContract(
          [dai.address],
          values,
          args.signedHash
        );
      } catch (err) {
        console.log(err);
        throw new UserInputError("Invalid signature or input", {
          invalidArgs: Object.keys(args),
        });
      }

      try {
        contract.acceptedValues = values;
        _contract.set("tiers", []);

        let tier;
        for (var j = 0; j < args.tiers.length; j++) {
          tier = new Tier();
          tier.id = mongoose.Types.ObjectId();
          tier.title = args.tiers[j].title;
          tier.value = args.tiers[j].value;
          tier.perks = args.tiers[j].perks;
          tier.save();
          _contract.tiers.push(tier);
        }

        _contract.save();

        contract = merge(contract, _contract);

        return contract;
      } catch (err) {
        console.log(err);
        throw new UserInputError("Local Server Error", {
          invalidArgs: Object.keys(args),
        });
      }
    },

    createContract: async (_, args) => {
      // Check if user has contract

      let contract = await getContract(args.publisher.toLowerCase());
      // let contract = null;

      if (contract) {
        throw new UserInputError("User already has contract", {
          invalidArgs: Object.keys(args),
        });
      }

      let values = [];
      for (var i = 0; i < args.tiers.length; i++) {
        values.push(
          ethers.constants.WeiPerEther.mul(args.tiers[i].value).toString()
        );
      }

      try {
        await factory.createSubscription(args.publisher, [dai.address], values);

        // Not sure if there is a better way to get the address.
        var address = await factory.getSubscription(
          args.publisher.toLowerCase()
        );

        let _contract = new Contract();
        _contract._id = address.toLowerCase();
        let _publisher = await User.findById(args.publisher).populate(
          "contract"
        );

        if (_publisher === null) {
          _publisher = await User.create({_id: args.publisher});
        }

        let tier;
        for (var j = 0; j < args.tiers.length; j++) {
          tier = new Tier();
          tier.id = mongoose.Types.ObjectId();
          tier.title = args.tiers[j].title;
          tier.value = args.tiers[j].value;
          tier.perks = args.tiers[j].perks;
          tier.save();
          _contract.tiers.push(tier);
        }

        _contract.publisher = _publisher;
        await _contract.save();
        _publisher.contract = _contract._id;
        await _publisher.save();

        contract = {};

        contract.id = address;
        contract.acceptedValues = values;
        contract.paymentTokens = [dai.address];
        contract.publisher = _publisher;
        contract.publisherNonce = 0;
        contract.subscribers = [];

        return contract;
      } catch (err) {
        console.log(err);
        return;
      }
    },
  },
};

module.exports = resolver;
