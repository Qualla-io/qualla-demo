import {ApolloServer, gql} from "apollo-server";
import {buildFederatedSchema} from "@apollo/federation";

const typeDefs = gql`
  type Query {
    me: User
  }
  type User @key(fields: "id") {
    id: ID! # Eth Address
    username: String
  }
`;

const resolvers = {
  Query: {
    me() {
      return {id: "1", username: "@gbaby"};
    },
  },
  User: {
    //   Not sure what this does
    __resolveReference(user, {fetchUserById}) {
      return fetchUserById(user.id);
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{typeDefs, resolvers}]),
});


server.listen(4001).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});