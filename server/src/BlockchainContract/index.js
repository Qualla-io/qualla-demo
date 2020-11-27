import {ApolloServer, gql} from "apollo-server";
import {buildFederatedSchema} from "@apollo/federation";

import {getUser, getUsers} from "../datasources/userData";
import {getContract, getContracts} from "../datasources/contractData";

const typeDefs = gql`
  type Query {
    contract(id: ID!): Contract
    contracts: [Contract!]
  }

  extend type User @key(fields: "id") {
    id: ID! @external
  }

  type Contract @key(fields: "id") {
    id: ID!
    publisher: User!
    #   subscribers: [Subscription!]
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
