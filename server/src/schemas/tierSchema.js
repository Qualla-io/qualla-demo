import {gql} from "apollo-server";

export default gql`
  type Tier {
    id: ID!
    contract: Contract
    value: Float
    title: String
    perk: String
  }
`;
