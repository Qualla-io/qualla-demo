import {createApolloFetch} from "apollo-fetch";

const fetch = createApolloFetch({
  uri: process.env.GRAPH_URI,
});

const GET_CONTRACT = `
  query GetContract($id: String!) {
    subscriptionContract(id: $id){
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

export async function getContract(id) {
  const res = await fetch({
    query: GET_CONTRACT,
    variables: {id},
  });
  // console.log(res)
  if (res.data) {
    return res.data.subscriptionContract;
  } else {
    return {id: id};
  }
}

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

export async function getContracts() {
  const res = await fetch({
    query: GET_CONTRACTS,
  });
  return res.data.subscriptionContracts;
}
