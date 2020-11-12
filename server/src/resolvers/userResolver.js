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

const resolver = {
  Query: {
    users: async () => {
      // Pull from graph protocol
      let users = await getUsers();

      let userIds = users.map(({id}) => id);

      let _users = await User.find()
        .where("_id")
        .in(userIds)
        .populate("contract");

      users = merge(users, _users);

      return users;
    },
    user: async (_, args) => {
      // pull from graph protocol
      let user = await getUser(args.id.toLowerCase());
      console.log(user);

      if (!user) {
        return user;
      }

      // pull from local data
      let _user = await User.findById(user.id.toLowerCase())
        .populate("contract")
        .exec();

      if (_user) {
        user = merge(user, _user);
      }

      return user;
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
