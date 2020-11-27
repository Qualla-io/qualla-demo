import fetch from "./config";

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

export async function getSubscription(id) {
  const res = await fetch({
    query: GET_SUBSCRIPTION,
    variables: {id},
  });
  return res.data.subscriptionObj;
}
