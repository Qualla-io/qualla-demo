const Contract = require("../models/contract");
const User = require("../models/user");

const resolver = {
  Query: {
    users: async () => await User.find({}).populate(""),
    user: async (_, args) => {
      let user = await User.findById(args.id).exec();
      if (user) {
        let contract = await Contract.findOne({
          publisher: user.id,
        }).populate("publisher");
        user.set("contract", contract, {strict: false});
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
