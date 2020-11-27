import merge from "lodash.merge";

const resolver = {
  Query: {
    subscription: async (_, {id}, {dataSources}) => {
      return await dataSources.graphAPI.getSubscription(id);
    },
  },
  Subscription: {
    subscriber: async (root, _, {dataSources}) => {
      //   console.log(root);

      let user = await dataSources.graphAPI.getUser(root.subscriber.id);

      let _user = await dataSources.localAPI.getUser(root.subscriber.id, false);

      user = merge(_user.toObject(), user);

      return user;
    },
  },
};

module.exports = resolver;
