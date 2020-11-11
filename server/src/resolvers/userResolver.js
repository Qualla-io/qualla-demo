import Contract from "../models/contract";
import User from "../models/user";
import {
  getContract,
  getContracts,
  getUser,
  getUsers,
} from "../datasources/contractData";

import merge from "lodash.merge";
import userSchema from "../schemas/userSchema";

const resolver = {
  Query: {
    users: async () => {
      // Pull from graph protocol
      let users = await getUsers();
      let contracts = users.map(({contract}) => contract);

      let userIds = users.map(({id}) => id);

      let _users = await User.find().where("_id").in(userIds);

      users = merge(_users, users);

      let contractIds = contracts.map(({id}) => id);
      let _contracts = await Contract.find()
        .where("_id")
        .in(contractIds)
        .populate("publisher");

      return users;
    },
    user: async (_, args) => {
      let user = await getUser(args.id.toLowerCase());
      if (user) {
        // pull from graph protocol
        let contract = await getContract(user.id.toLowerCase());

        if (contract) {
          // pull from local
          const _contract = await Contract.findById(contract.id.toLowerCase())
            .populate("publisher")
            .exec();

          // stitch
          if (_contract) {
            contract.publisher = _contract.publisher;
          }
        }
      }
      console.log(user);
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
  },
};

module.exports = resolver;
