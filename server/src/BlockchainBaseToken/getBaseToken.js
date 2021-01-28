import { createApolloFetch } from "apollo-fetch";
// import { gql } from "apollo-server";

const fetch = createApolloFetch({
  uri: process.env.GRAPH_URI,
});

const GET_BASETOKEN = `
  query GetBaseToken($id: String!) {
    baseToken(id: $id) {
      id
      quantity
      owner{
        id
      }
      paymentValue
      paymentToken
      activeTokens{
        id
      }
      txHash
      initialSupply
    }
  }
`;

export async function getBaseToken(id) {
  const res = await fetch({
    query: GET_BASETOKEN,
    variables: { id },
  });
  if (res.data.baseToken) {
    return res.data.baseToken;
  } else {
    return null;
  }
}

const GET_BASETOKENS = `
  query GetBaseTokens {
    baseTokens {
      id
      quantity
      owner{
        id
      }
      paymentValue
      paymentToken
      activeTokens{
        id
      }
      txHash
      initialSupply
    }
  }
`;

export async function getBaseTokens() {
  const res = await fetch({
    query: GET_BASETOKENS,
  });
  return res.data.baseTokens;
}

const GET_NFT = `
  query GetNfts($id: ID!) {
    nftToken(id: $id){
      id
      uriID
      creator{
        id
      }
      owner {
        id
      }
    }
  }
`;

export async function getNFT(id) {
  const res = await fetch({
    query: GET_NFT,
    variables: { id },
  });
  if (res.data.nftToken) {
    return res.data.nftToken;
  } else {
    return null;
  }
}

const GET_NFTS = `
  query GetNfts {
    nftTokens{
      id
      uriID
      creator{
        id
      }
      owner {
        id
      }
    }
  }
`;

export async function getNFTs() {
  const res = await fetch({
    query: GET_NFTS,
  });
  return res.data.nftTokens;
}
