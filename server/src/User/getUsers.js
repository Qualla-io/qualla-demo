import { createApolloFetch } from "apollo-fetch";
import { gql } from "apollo-server";

const fetch = createApolloFetch({
  uri: process.env.GRAPH_URI,
});

const GET_USER = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      tierTokens {
        id
      }
      beamTokens {
        id
      }
      balances {
        id
        netDeposit
        netFlowrate
        settledBalance
        lastUpdated
      }
      subscribers {
        id
      }
      nonce
      ownedNFTs {
        id
      }
      createdNFTs {
        id
      }
    }
  }
`;

export async function getUser(id) {
  const res = await fetch({
    query: GET_USER,
    variables: { id },
  });
  if (res.data.user) {
    return res.data.user;
  } else {
    return {
      id: id,
      baseTokens: null,
      subscriptions: null,
      subscribers: null,
      nonce: 0,
    };
  }
}

const GET_USERS = `
  query GetUsers {
    users(where: {id_not: "0x0000000000000000000000000000000000000000"}) {
      id
      tierTokens {
        id
      }
      beamTokens {
        id
      }
      balances {
        id
        netDeposit
        netFlowrate
        settledBalance
        lastUpdated
      }
      subscribers {
        id
      }
      nonce
      ownedNFTs {
        id
      }
      createdNFTs {
        id
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

const GET_SUBBED_TO = `
  query GetSubbedTo($userID: ID!, $creatorID: String!) {
    user(id: $userID) {
      id
      approved
      nonce
      beamTokens(where: {creator: $creatorID}) {
        id
        creator {
          id
        }
        owner {
          id
        }
        tierToken {
          id
        }
      }
    }
  }
`;

export async function getSubbedTo(userID, creatorID) {
  const res = await fetch({
    query: GET_SUBBED_TO,
    variables: { userID, creatorID },
  });
  return res.data.user;
}

const GET_BALANCE = `
  query GetBalance($id: ID!) {
    balance(id: $id) {
      id
      qtoken {
        id
      }
      user {
        id
      }
      settledBalance
      netFlowrate
      netDeposit
      lastUpdated
    }
  }
`;

export async function getBalance(id) {
  console.log(id)
  const res = await fetch({
    query: GET_BALANCE,
    variables: { id },
  });
  console.log(res);
  return res?.data?.balance;
}

const GET_BALANCES_OF = `
  query getBalancesOf($userID: ID!) {
    balances(where: { user: $userID }) {
      id
      qtoken {
        id
      }
      user {
        id
      }
      settledBalance
      netFlowrate
      netDeposit
      lastUpdated
    }
  }
`;

export async function getBalancesOf(userID) {
  const res = await fetch({
    query: GET_BALANCES_OF,
    variables: { userID },
  });
  return res.data.balances;
}

const GET_QTOKEN = `
  query getQToken($id: ID){
    qtoken(id: $id){
      id
      underlyingToken
      name
      symbol
      decimals
      totalSupply
    }
  }
`;

export async function getQToken(id) {
  const res = await fetch({
    query: GET_QTOKEN,
    variables: { id },
  });
  return res.data.qtoken;
}

const GET_QTOKENS = `
  query getQTokens {
    qtokens {
      id
      underlyingToken
      name
      symbol
      decimals
      totalSupply
    }
  }
`;

export async function getQTokens() {
  const res = await fetch({
    query: GET_QTOKENS,
  });
  return res.data.qtokens;
}

// const GET_TRANSACTION = `
// query GetTransaction($id: String!) {
//   transaction(id: $id) {
//     id
//     to {
//       id
//     }
//     from {
//       id
//     }
//     amount
//     timestamp
//   }
// }
// `;

// export async function getTransaction(id) {
//   const res = await fetch({
//     query: GET_TRANSACTION,
//     variables: { id },
//   });
//   return res.data.transaction;
// }

// const GET_TRANSACTIONS = `
// query GetTransactionS{
//   transactions {
//     id
//     to {
//       id
//     }
//     from {
//       id
//     }
//     amount
//     timestamp
//   }
// }
// `;

// export async function getTransactions() {
//   const res = await fetch({
//     query: GET_TRANSACTIONS,
//   });
//   return res.data.transactions;
// }

// const GET_TRANSACTION_TO = `
// query GetTransactionTo($id: ID!) {
//   transactions(where: {to: $id}) {
//     id
//     to {
//       id
//     }
//     from {
//       id
//     }
//     amount
//     timestamp
//   }
// }
// `;

// export async function getUserTransactionsTo(id) {
//   const res = await fetch({
//     query: GET_TRANSACTION_TO,
//     variables: { id },
//   });
//   console.log(res);
//   return res.data.transactions;
// }

// const GET_TRANSACTION_FROM = `
// query GetTransactionFrom($id: String!) {
//   transactions(where: {from: $id}) {
//     id
//     to {
//       id
//     }
//     from {
//       id
//     }
//     amount
//     timestamp
//   }
// }
// `;

// export async function getUserTransactionsFrom(id) {
//   const res = await fetch({
//     query: GET_TRANSACTION_FROM,
//     variables: { id },
//   });
//   return res.data.transactions;
// }
