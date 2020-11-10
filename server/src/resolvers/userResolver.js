const Contract = require("../models/contract");
const User = require("../models/user");

const resolver = {
  Query: {
    users: async () => await User.find({}).populate(""),
    user: async (_, args) => {
      let user = await User.findById(args.address).exec();
      if (user) {
        let contract = await Contract.findOne({
          publisher: user.address,
        }).populate("publisher");
        user.set("contract", contract, {strict: false});
      }
      console.log(user);
      return user;
    },
  },
  Mutation: {
    user: async (_, args) => {
      let user = await User.findById(args.address);
      if (user === null) {
        user = await User.create({_id: args.address});
      }
      user.username = args.username;
      user.save();
      return user;
    },
  },
};

module.exports = resolver;
