import {DataSource} from "apollo-datasource";
import {createApolloFetch} from "apollo-fetch";
import {gql} from "apollo-server";

class GraphProtocolAPI extends DataSource {
  constructor() {
    super();
    this.baseURL =
      "http://127.0.0.1:8000/subgraphs/name/ghardin1314/qualla-demoV1";

    this.fetch = createApolloFetch({
      uri: this.baseURL,
    });
  }

  async getContracts() {
    const GET_CONTRACTS = `
      query GetContracts {
        subscriptionContracts {
          id
          publisher {
            id
          }
          publisherNonce
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
          }
        }
      }
    `;

    const res = await this.fetch({
      query: GET_CONTRACTS,
    });
    return res.data.subscriptionContracts;
  }

  async getContract(id) {
    const GET_CONTRACT = `
      query GetContract($id: String!) {
        subscriptionContract(id: $id) {
          id
          publisher {
            id
          }
          publisherNonce
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
          }
        }
      }
    `;

    const res = await this.fetch({
      query: GET_CONTRACT,
      variables: {id},
    });
    if(res.data.subscriptionContract){
      return res.data.subscriptionContract;
    } else{
      return null
    }
    
  }

  async getUsers() {
    const GET_USERS = `
    query GetUsers {
      users {
        id
        contract {
          id
        }
        subscriptions{
          id
        }
      }
    }
  `;

    const res = await this.fetch({
      query: GET_USERS,
    });

    return res.data.users;
  }

  async getUser(id) {
    const GET_USER = `
    query GetUser($id: String!) {
      user(id: $id) {
        id
        contract {
          id
        }
        subscriptions{
          id
        }
      }
    }
  `;
    const res = await this.fetch({
      query: GET_USER,
      variables: {id},
    });
    if(res.data.user){
      return res.data.user;
    } else {
      return null
    }
    
  }

  async getSubscription(id) {
    const GET_SUBSCRIPTION = `
      query GetSubscription($id: String!) {
        subscriptionObj(id: $id) {
          id
          subscriber {
            id
          }
          contract {
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
    `;
    const res = await this.fetch({
      query: GET_SUBSCRIPTION,
      variables: {id},
    });
    return res.data.subscriptionOjb;
  }
}

export default GraphProtocolAPI;
