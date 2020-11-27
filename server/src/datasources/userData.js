import fetch from "./config";

const GET_USER = `
  query GetUser($id: String!) {
    user(id: $id) {
      id
      contract {
        id
      }
      subscriptions{
        id
        value
        status
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
      }
      subscriptions{
        id
        value
        status
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

export async function getUsers() {
  const res = await fetch({
    query: GET_USERS,
  });
  console.log(res)
  return res.data.users;
}
