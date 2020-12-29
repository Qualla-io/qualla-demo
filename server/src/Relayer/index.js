import { createApolloFetch } from "apollo-fetch";
import { ethers } from "ethers";
import { gql } from "apollo-server";

import { subscriptionV1 } from "./utils";

const fetch = createApolloFetch({
  uri: process.env.GRAPH_URI,
});

const GET_READY_SUBTOKENS = `
  query GetReadySubTokens($date: BigInt!) {
    subscriptionTokens(first: 1000, where: {nextWithdraw_lt: $date}) {
      id
      creator{
        id
      }
      owner{
        id
      }
      nextWithdraw
      baseToken{
        id
      }
    }
  }
`;

async function execSubs() {
  let date = Math.floor(Date.now() / 1000);

  console.log(`running at: ${date}`);

  try {
    const res = await fetch({
      query: GET_READY_SUBTOKENS,
      variables: { date },
    });

    let subscriptions = res.data.subscriptionTokens;
    let subscription;
    for (var i = 0; i < subscriptions.length; i++) {
      subscription = subscriptions[i];

      console.log(subscription);

      let subscriber = subscription.owner.id;

      try {
        await subscriptionV1.executeSubscription(subscription.id, subscriber);
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.log("Fetch error");
    console.log(err)
  }

  setTimeout(execSubs, 15000);
}

setTimeout(execSubs, 5000);
