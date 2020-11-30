import {ApolloServer, gql} from "apollo-server";
import {buildFederatedSchema} from "@apollo/federation";
import {ethers} from "ethers";

import {getContract, getContracts} from "./contractData";
import {dai, factory, account, SubscriptionV1} from "./utils";

const typeDefs = gql`
  type Query {
    contract(id: ID!): Contract
    contracts: [Contract!]
  }

  type Mutation {
    createContract(publisher: ID!, tiers: [TierInput!]!): Contract!
    modifyContract(
      id: String!
      tiers: [TierInput!]!
      signedHash: String!
    ): Contract!
  }

  input TierInput {
    value: Float!
    perks: String!
    title: String!
  }

  extend type User @key(fields: "id") {
    id: ID! @external
  }

  extend type SubscriptionObj @key(fields: "id") {
    id: ID! @external
  }

  type Contract @key(fields: "id") {
    id: ID!
    publisher: User!
    subscribers: [SubscriptionObj!]
    acceptedValues: [Float!]
    paymentTokens: [String!]
    publisherNonce: Int
  }
`;

const resolvers = {
  Query: {
    contract: async (_, {id}) => {
      return getContract(id);
    },
    contracts: async () => getContracts(),
  },
  Mutation: {
    createContract: async (_, {publisher, tiers}) => {
      //  TODO: check if user already has contract

      let values = [];
      for (var i = 0; i < tiers.length; i++) {
        values.push(
          ethers.constants.WeiPerEther.mul(tiers[i].value).toString()
        );
      }

      await factory.createSubscription(publisher, [dai.address], values);
      var address = await factory.getSubscription(publisher.toLowerCase());

      let contract = {};
      contract.id = address;
      contract.paymentTokens = [dai.address];
      contract.acceptedValues = values;
      contract.publisherNonce = 0;
      contract.tiers = tiers;
      console.log(contract);

      return contract;
    },
    modifyContract: async (_, {id, tiers, signedHash}) => {
      // TODO: Test this!
      let _contract = getContract(id);

      if (_contract === null) {
        throw new UserInputError("Contract does not exsist", {
          invalidArgs: Object.keys(id),
        });
      }

      var subscriptionV1 = new ethers.Contract(id, SubscriptionV1.abi, account);

      let values = [];
      for (var i = 0; i < tiers.length; i++) {
        values.push(
          ethers.constants.WeiPerEther.mul(tiers[i].value).toString()
        );
      }

      try {
        await subscriptionV1.modifyContract(
          [dai.address],
          values,
          signedHash
        );
      } catch (err) {
        console.log(err);
        throw new UserInputError("Invalid signature or input", {
          invalidArgs: Object.keys(signedHash),
        });
      }

      _contract.paymentTokens = [dai.address];
      _contract.acceptedValues = values;
      _contract.publisherNonce++;

      return _contract;
    },
  },
  Contract: {
    __resolveReference(contract) {
      return getContract(contract.id);
    },
    publisher: async (contract) => {
      return {__typename: "User", id: contract.publisher.id};
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});

server.listen(4002).then(({url}) => {
  console.log(`🚀 Server ready at ${url}`);
});
