import Contract from "../models/contract";
import User from "../models/user";
import {UserInputError} from "apollo-server";

const resolver = {
  Query: {
    contracts: async () => await Contract.find({}).populate("publisher"),
    contract: async (_, args) => {
      const contract = await Contract.findById(args.id).populate("publisher");
      return contract;
    },
  },
  Mutation: {
    createContract: async (_, args) => {
      let contract = await Contract.findById(args.id);

      if (contract) {
        throw new UserInputError("Contract address exsists", {
          invalidArgs: Object.keys(args),
        });
      }
      contract = new Contract();
      contract._id = args.id;

      let publisher = await User.findById(args.publisher);

      if (publisher === null) {
        await User.create({id: args.publisher});
      }

      contract.publisher = publisher;

      await contract.save();
      contract = await Contract.findById(args.id).populate("publisher");
      console.log(contract);
      return contract;
    },
  },
};

module.exports = resolver;
