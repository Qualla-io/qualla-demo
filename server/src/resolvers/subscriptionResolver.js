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

      let _user = await dataSources.localAPI.getUser(root.subscriber.id);

      user = merge(_user, user);
      return user;
    },
    // contract: async (root, args, {dataSources}) => {

    //   console.log(root)
    //   console.log(args)

    //   let contract = await dataSources.graphAPI.getContract(root.contract.id);

    //   let _contract = await dataSources.localAPI.getContract(root.contract.id);

    //   // Stitch
    //   contract = merge(_contract, contract);

    //   return contract;
    // },
  },
};

module.exports = resolver;
