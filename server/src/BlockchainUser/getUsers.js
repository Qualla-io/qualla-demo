import { createApolloFetch } from "apollo-fetch";
// import { gql } from "apollo-server";

const fetch = createApolloFetch({
  uri: process.env.GRAPH_URI,
});

const GET_USER = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      nonce
      approved
      balance
      baseTokens {
        id
      }
      subscriptions {
        id
      }
      subscribers {
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
    users {
      id
      nonce
      approved
      balance
      baseTokens {
        id
      }
      subscriptions {
        id
      }
      subscribers {
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
      subscriptions(where: {creator: $creatorID}) {
        id
        creator {
          id
        }
        owner {
          id
        }
        baseToken {
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
  console.log(res.data.user);
  return res.data.user;
}

const GET_TRANSACTION = `
query GetTransaction($id: String!) {
  transaction(id: $id) {
    id
    to {
      id
    }
    from {
      id
    }
    amount
    timestamp
  }
}
`;

export async function getTransaction(id) {
  const res = await fetch({
    query: GET_TRANSACTION,
    variables: { id },
  });
  return res.data.transaction;
}

const GET_TRANSACTIONS = `
query GetTransactionS{
  transactions {
    id
    to {
      id
    }
    from {
      id
    }
    amount
    timestamp
  }
}
`;

export async function getTransactions() {
  const res = await fetch({
    query: GET_TRANSACTIONS,
  });
  return res.data.transactions;
}

const GET_TRANSACTION_TO = `
query GetTransactionTo($id: ID!) {
  transactions(where: {to: $id}) {
    id
    to {
      id
    }
    from {
      id
    }
    amount
    timestamp
  }
}
`;

export async function getUserTransactionsTo(id) {
  const res = await fetch({
    query: GET_TRANSACTION_TO,
    variables: { id },
  });
  console.log(res);
  return res.data.transactions;
}

const GET_TRANSACTION_FROM = `
query GetTransactionFrom($id: String!) {
  transactions(where: {from: $id}) {
    id
    to {
      id
    }
    from {
      id
    }
    amount
    timestamp
  }
}
`;

export async function getUserTransactionsFrom(id) {
  const res = await fetch({
    query: GET_TRANSACTION_FROM,
    variables: { id },
  });
  return res.data.transactions;
}
