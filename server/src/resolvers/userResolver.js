import Contract from "../models/contract";
import User from "../models/user";
import {getUsers} from "../datasources/userData";
import {UserInputError} from "apollo-server";
import merge from "lodash.merge";
import userSchema from "../schemas/userSchema";
import {dai} from "../web3";
import {initial} from "lodash";
import {getContractById, getUserById} from "./helpers";
import contract from "../models/contract";

const resolver = {
  Query: {
    users: async (_, {}, {dataSources}) => {
      // Pull from graph protocol
      let users = await dataSources.graphAPI.getUsers();

      let _users = await dataSources.localAPI.getUsers();
      // .populate("contract");

      users = merge(_users, users);

      return users;
    },
    user: async (_, {id}, {dataSources}) => {
      let user = await dataSources.graphAPI.getUser(id.toLowerCase());

      let _user = await dataSources.localAPI.getUser(id.toLowerCase(), false);

      if (user || _user) {
        user = merge(_user.toObject(), user);
      }

      return user;
    },
  },
  User: {
    contract: async (parent, _, {dataSources}) => {
      if (parent.contract) {
        try {
          let contract = await dataSources.graphAPI.getContract(
            parent.contract.id
          );

          let _contract = await dataSources.localAPI.getContract(
            parent.contract.id
          );

          // Stitch
          if (contract || _contract) {
            contract = merge(_contract, contract);
          }
          return contract;
        } catch {
          let contract = await dataSources.graphAPI.getContract(
            parent.contract
          );

          let _contract = await dataSources.localAPI.getContract(
            parent.contract,
            false
          );

          // Stitch
          if (contract || _contract) {
            contract = merge(_contract.toObject(), contract);
          }

          return contract;
        }
      }
    },
  },
  // Contract: {
  //   subscribers: async (parent, _, {dataSources}) => {

  //     return parent.subscribers
  //   },
  // },
  // Subscription: {
  //   subscriber: async(parent, _, {dataSources})=> {
  //     console.log(parent)
  //   }
  // },
  Mutation: {
    user: async (_, {id, username}, {dataSources}) => {
      let _user = await dataSources.localAPI.getUser(id.toLowerCase(), false);

      if (_user === null) {
        _user = await User.create({_id: id.toLowerCase()});
      }

      _user.username = username;
      _user.save();

      let user = await dataSources.graphAPI.getUser(id.toLowerCase());

      user = merge(_user.toObject(), user);

      return user;
    },
    mintTokens: async (_, args) => {
      const initBal = await dai.balanceOf(args.id.toLowerCase());
      console.log(`Old balance: ${initBal}`);

      if (initBal < 3000000000000000000000) {
        await dai.mintTokens(args.id.toLowerCase());
      } else {
        throw new UserInputError("Excessive funds, don't be greedy!", {
          invalidArgs: Object.keys(args),
        });
      }
      const finalBal = await dai.balanceOf(args.id.toLowerCase());
      console.log(`New balance: ${finalBal}`);
    },
  },
};

module.exports = resolver;
