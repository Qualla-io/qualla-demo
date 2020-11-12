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

// const GET_USER = `
//   query GetUser($id: String!) {
//     user(id: $id) {
//       id
//       contract {
//         id
//         publisher{
//           id
//         }
//         publisherNonce
//         factory {
//           id
//           fee
//         }
//         paymentTokens
//         acceptedValues
//         subscribers {
//           id
//           subscriber {
//             id
//           }
//           status
//           value
//           paymentToken
//           subNum
//           hash
//           signedHash
//           nextWithdraw
//           nonce
//         }
//       }
//     }
//   }
// `;

const GET_USER = `
  query GetUser($id: String!) {
    user(id: $id) {
      id
      contract {
        id
      }
    }
  }
`;

export async function getUser(id) {
  const res = await fetch({
    query: GET_USER,
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
