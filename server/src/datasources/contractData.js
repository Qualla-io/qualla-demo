import fetch from "./config";

const GET_CONTRACT = `
  query GetContract($id: String!) {
    user(id: $id) {
      id
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
  // This id is actually the publisher's id. May change later
  const res = await fetch({
    query: GET_CONTRACT,
    variables: {id},
  });
  if (res.data.user) {
    return res.data.user.contract;
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

export async function getUser(id) {
  const res = await fetch({
    query: GET_CONTRACT,
    variables: {id},
  });
  if (res.data.user) {
    return res.data.user;
  } else {
    return null;
  }
}

const GET_USERS = `
  query GetUsers {
    users {
      id
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

export async function getUsers() {
  const res = await fetch({
    query: GET_USERS,
  });
  return res.data.users;
}
