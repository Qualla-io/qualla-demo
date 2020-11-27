import {ApolloServer, gql} from "apollo-server";
import {buildFederatedSchema} from "@apollo/federation";

import {getUser, getUsers} from "../datasources/userData";

const typeDefs = gql`
  type Query {
    user(id: ID!): User
    users: [User!]
  }

  type User @key(fields: "id") {
    id: ID!
    username: String
    contract: String
    # contract: Contract
    # subscriptions: [Subscription!]
  }

  #   type Contract @key(fields: "id") {
  #     id: ID!
  #     publisher: User
  #     subscribers: [Subscription!]
  #     acceptedValues: [Float!]
  #     paymentTokens: [String!]
  #     publisherNonce: Int
  #   }

  #   type Subscription @key(fields: "id") {
  #     id: ID!
  #     subscriber: User!
  #     contract: Contract!
  #     value: Float!
  #     status: Status!
  #     paymentToken: String
  #     subNum: Float!
  #     hash: String
  #     signedHash: String
  #     nextWithdraw: Float
  #     nonce: Float
  #   }

  #   enum Status {
  #     ACTIVE
  #     PAUSED
  #     CANCELED
  #     EXPIRED
  #   }
`;

const resolvers = {
  Query: {
    user: async (_, {id}) => {
      return getUser(id);
    },
    users: async () => await getUsers(),
  },

  User: {
    __resolveReference(user, {getUser}) {
      console.log(user);
      return getUser(user.id);
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

server.listen(4001).then(({url}) => {
  console.log(`🚀 Server ready at ${url}`);
});
