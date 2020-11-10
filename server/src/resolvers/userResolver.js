const User = require("../models/user");

const resolver = {
  Query: {
    users: async () => await User.find({}).populate(""),
    user: async (_, args) => {
      await User.findById(args.address).exec();
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
