import {gql} from "apollo-server";

import contractScheme from "./contractSchema";
import userScheme from "./userSchema";
import tierScheme from "./tierSchema";

const linkSchema = gql`
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
`;

export default [linkSchema, contractScheme, userScheme, tierScheme];
