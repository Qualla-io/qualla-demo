import Contract from "../models/contract";
import User from "../models/user";
import Tier from "../models/tier";
import {UserInputError} from "apollo-server";
import {ethers} from "ethers";
import {provider, dai, factory, account, SubscriptionV1} from "../web3";
import merge from "lodash.merge";
import mongoose from "mongoose";
import {getContractById, getUserById} from "./helpers";

const resolver = {
  Query: {
    contracts: async (_, {}, {dataSources}) => {
      // Pull from graph protocol
      let contracts = await dataSources.graphAPI.getContracts();

      // Pull from local data
      let _contracts = await dataSources.localAPI.getContracts();

      // Stitch
      contracts = merge(_contracts, contracts);

      return contracts;
    },

    contract: async (_, {id}, {dataSources}) => {
      let contract = await dataSources.graphAPI.getContract(id.toLowerCase());

      let _contract = await dataSources.localAPI.getContract(id.toLowerCase());

      // Stitch
      contract = merge(_contract, contract);

      return contract;
    },
  },
  Contract: {
    publisher: async (root, _, {dataSources}) => {
      let user = await dataSources.graphAPI.getUser(root.publisher.id);

      let _user = await dataSources.localAPI.getUser(root.publisher.id, false);
      console.log(user);
      console.log(_user);

      user = merge(_user, user);

      console.log(user);

      return user;
    },
  },
  Mutation: {
    modifyContract: async (_, args, {dataSources}) => {
      // this works besides the actual on chain modification.
      // TODO: Test with front end

      // Check if user has contract
      let publisher = await dataSources.graphAPI.getUser(
        args.publisher.toLowerCase()
      );

      if (!publisher) {
        throw new UserInputError("User does not exsist", {
          invalidArgs: Object.keys(args),
        });
      }

      if (!publisher.contract) {
        throw new UserInputError("User does not have active contract", {
          invalidArgs: Object.keys(args),
        });
      }

      let contract = await dataSources.graphAPI.getContract(
        publisher.contract.id.toLowerCase()
      );

      let _contract = await dataSources.localAPI.getContract(
        contract.id.toLowerCase(),
        false
      );

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

        contract = merge(_contract.toObject(), contract);

        contract.paymentTokens = [dai.address];
        contract.acceptedValues = values;
        contract.publisherNonce++;

        return contract;
      } catch (err) {
        console.log(err);
        throw new UserInputError("Local Server Error", {
          invalidArgs: Object.keys(args),
        });
      }
    },

    createContract: async (_, args, {dataSources}) => {
      // Check if user has contract

      let publisher = await dataSources.graphAPI.getUser(
        args.publisher.toLowerCase()
      );

      if (publisher && publisher.contract) {
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
        let _publisher = await dataSources.localAPI.getUser(args.publisher);

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

        let contract = await dataSources.graphAPI.getContract(
          address.toLowerCase()
        );

        contract = merge(_contract.toObject(), contract);

        contract.paymentTokens = [dai.address];
        contract.acceptedValues = values;
        contract.publisherNonce = 0;

        return contract;
      } catch (err) {
        console.log(err);
        return;
      }
    },

    fakeSub: async (_, args) => {
      let publisher = await getUserById(args.publisher.toLowerCase());

      if (!publisher) {
        throw new UserInputError("User does not exsist", {
          invalidArgs: Object.keys(args),
        });
      }

      if (!publisher.contract) {
        throw new UserInputError("User does not have active contract", {
          invalidArgs: Object.keys(args),
        });
      }

      let contract = await getContractById(publisher.contract.id.toLowerCase());

      var subscriptionV1 = new ethers.Contract(
        contract.id,
        SubscriptionV1.abi,
        account
      );

      var initBal = await dai.balanceOf(account.address);

      initBal = initBal.toString();

      const valLength = contract.acceptedValues.length;

      let value = contract.acceptedValues[valLength - 1];
      value = value.toString();

      let allowance = await dai.allowance(account.address, contract.id);
      allowance = allowance.toString();

      if (allowance < value) {
        let allowed = ethers.BigNumber.from(value);
        allowed = allowed.mul(5);
        allowed = allowed.toString();

        await dai.approve(contract.id, allowed);
      }

      let subscribers = contract.subscribers;
      // Check if already a subscriber

      let hash = await subscriptionV1.getSubscriptionHash(
        account.address,
        value,
        dai.address,
        0,
        0
      );

      const signedHash = await account.signMessage(ethers.utils.arrayify(hash));

      let _subscriber = await getUserById(account.address);

      // console.log(_subscriber);

      await subscriptionV1.createSubscription(
        account.address,
        value,
        dai.address,
        signedHash
      );

      // console.log(_subscriber);

      if (_subscriber === null) {
        _subscriber = await User.create({_id: account.address});
        _subscriber.username = "Alice";
        _subscriber.subscriptions = [contract.id];
      } else {
        _subscriber.subscriptions.push(contract.id);
      }

      // console.log(_subscriber);

      await _subscriber.save();

      contract = await getContractById(publisher.contract.id.toLowerCase());
    },
  },
};

module.exports = resolver;
