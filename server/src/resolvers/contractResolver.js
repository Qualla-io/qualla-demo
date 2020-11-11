import Contract from "../models/contract";
import User from "../models/user";
import {UserInputError} from "apollo-server";

import {getContract, getContracts} from "../datasources/graphProtocol";
import {provider, acount, dai, factory, account} from "../web3";

const resolver = {
  Query: {
    contracts: async () => {
      // Pull from graph protocol
      let contracts = await getContracts();
      let ids = contracts.map(({id}) => id);

      // Pull from local data
      let _contracts = await Contract.find()
        .where("_id")
        .in(ids)
        .populate("publisher");

      // Stitch
      for (var _contract in _contracts) {
        // TODO: test this more
        let found = contracts.find(
          (element) =>
            element.id == "0x027e9fa1cc3d5cf71d46f1951a1a5ea186a2ae8e"
        );
        console.log(found);
        let i = contracts.indexOf(found);
        console.log(i);
        if (i >= 0) {
          contracts[i].publisher = _contract.publisher;
        }
      }
      return contracts;
    },
    contract: async (_, args) => {
      // finds contract by address of publisher

      // Pull from graph protocol
      let contract = await getContract(args.id.toLowerCase());
      if (!contract) {
        return contract;
      }

      // Pull from local data
      console.log(contract.id);
      const _contract = await Contract.findById(contract.id.toLowerCase())
        .populate("publisher")
        .exec();

      // Stitch
      if (_contract) {
        contract.publisher = _contract.publisher;
      }

      return contract;
    },
  },
  Mutation: {
    createContract: async (_, args) => {
      // Check if user has contract

      let contract = await getContract(args.publisher.toLowerCase());
      console.log(contract);

      if (contract) {
        throw new UserInputError("User already has contract", {
          invalidArgs: Object.keys(args),
        });
      }

      // let values = [];
      // for (var i = 0; i < tiers.length; i++) {
      //   values.push(ethers.constants.WeiPerEther.mul(tiers[i].value));
      // }

      try {
        console.log(args.values);

        await factory.createSubscription(
          args.publisher,
          [dai.address],
          args.values
        );

        // Not sure if this works or the turnaround time is too short
        var address = await factory.getSubscription(
          args.publisher.toLowerCase()
        );
        console.log(address);

        let _contract = new Contract();
        _contract._id = address.toLowerCase();
        let _publisher = await User.findById(args.publisher);

        if (_publisher === null) {
          _publisher = await User.create({_id: args.publisher});
        }

        _contract.publisher = _publisher;

        await _contract.save();
        await _publisher.save();

        contract = {};

        contract.id = address;
        contract.acceptedValues = args.values;
        contract.paymentTokens = [dai.address];
        contract.publisher = _publisher;
        contract.publisherNonce = 0;
        contract.subscribers = [];

        console.log(contract);

        return contract;
      } catch (err) {
        console.log(err);
        return;
      }
    },
    //     let contract = await Contract.findById(args.id);

    //     if (contract) {
    //       throw new UserInputError("Contract address exsists", {
    //         invalidArgs: Object.keys(args),
    //       });
    //     }
    //     contract = new Contract();
    //     contract._id = args.id;

    //     let publisher = await User.findById(args.publisher);

    //     if (publisher === null) {
    //       await User.create({id: args.publisher});
    //     }

    //     contract.publisher = publisher;

    //     await contract.save();
    //     contract = await Contract.findById(args.id).populate("publisher");
    //     console.log(contract);
    //     return contract;
    //   },
  },
};

module.exports = resolver;
