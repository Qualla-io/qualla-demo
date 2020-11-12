import fetch from "./config";

const GET_CONTRACT = `
  query GetContract($id: String!) {
    subscriptionContract(id: $id){
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

export async function getContract(id) {
  const res = await fetch({
    query: GET_CONTRACT,
    variables: {id},
  });
  if (res.data) {
    return res.data.subscriptionContract;
  } else {
    return null;
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



