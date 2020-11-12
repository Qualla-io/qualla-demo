import Contract from "../models/contract";
import User from "../models/user";
import {
  getContract,
  getContracts,
  getUser,
  getUsers,
} from "../datasources/contractData";
import {UserInputError} from "apollo-server";
import merge from "lodash.merge";
import userSchema from "../schemas/userSchema";
import {dai} from "../web3";
import {initial} from "lodash";
import {getContractById, getUserById} from "./helpers";

const resolver = {
  Query: {
    users: async () => {
      // Pull from graph protocol
      let users = await getUsers();

      let userIds = users.map(({id}) => id);

      let _users = await User.find().where("_id").in(userIds).lean();
      // .populate("contract");

      users = merge(_users, users);

      return users;
    },
    user: async (_, args) => {
      let user = getUserById(args.id);

      return user;
    },
  },
  User: {
    contract: async (parent) => {
      return getContractById(parent.contract.id);
    },
  },
  Mutation: {
    user: async (_, args) => {
      let user = await User.findById(args.id);
      if (user === null) {
        user = await User.create({_id: args.id});
      }
      user.username = args.username;
      user.save();
      return user;
    },
    mintTokens: async (_, args) => {
      const initBal = await dai.balanceOf(args.id);
      console.log(`Old balance: ${initBal}`);

      if (initBal < 3000000000000000000000) {
        await dai.mintTokens(args.id);
      } else {
        throw new UserInputError("Excessive funds", {
          invalidArgs: Object.keys(args),
        });
      }
      const finalBal = await dai.balanceOf(args.id);
      console.log(`New balance: ${finalBal}`);
    },
  },
};

module.exports = resolver;
