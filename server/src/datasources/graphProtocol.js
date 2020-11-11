import {createApolloFetch} from "apollo-fetch";

const fetch = createApolloFetch({
  uri: "http://127.0.0.1:8000/subgraphs/name/ghardin1314/qualla-demoV1",
});

const GET_CONTRACT = `
  query GetContract($id: String!) {
    user(id: $id) {
      contract {
        id
        publisher{
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
  }
`;

export async function getContract(id) {
  const res = await fetch({
    query: GET_CONTRACT,
    variables: {id},
  });
  if (res.data.user){
    return res.data.user.contract;
  }
  else {
    return null
  }
}

const GET_CONTRACTS = `
  query GetContracts {
    subscriptionContracts{
      id
      publisher{
        id
      }
      publisherNonce
      factory{
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
