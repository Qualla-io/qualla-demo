import {GraphQLDataSource} from "apollo-datasource-graphql";
import {gql} from "apollo-server-express";

const CONTRACT_INFO = gql`
  query {
    subscriptionContracts {
      id
      publisherNonce
      publisher {
        id
      }
      factory {
        id
        fee
      }
      paymentTokens
      acceptedValues
      subscribers {
        id
        subscriber {
          id
        }
        status
        value
        paymentToken
        subNum
        hash
        signedHash
        nextWithdraw
        nonce
      }
    }
  }
`;

export class GraphProtocolAPI extends GraphQLDataSource {
  baseurl = "http://127.0.0.1:8000/subgraphs/name/ghardin1314/qualla-demoV1";

  async getAllSubscriptionInfo() {
    try {
      const response = await this.query(CONTRACT_INFO);
      return response.data.subscriptionContracts;
    } catch (error) {
      console.log(err);
    }
  }
}
