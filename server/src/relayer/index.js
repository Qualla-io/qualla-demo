import {createApolloFetch} from "apollo-fetch";
import {ethers} from "ethers";
import {gql} from "apollo-server";

import {dai, SubscriptionV1, account} from "./utils";

const fetch = createApolloFetch({
  uri: process.env.GRAPH_URI,
});

const GET_SUBS = `
  query GetSubscriptions($date: BigInt!) {
    subscriptionObjs(first: 1000, where: {nextWithdraw_lt: $date}) {
      nextWithdraw
      value
      status
      paymentToken
      hash
      contract {
        id
      }
      subscriber {
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
      query: GET_SUBS,
      variables: {date},
    });

    let subscriptions = res.data.subscriptionObjs;
    let subscription;
    for (var i = 0; i < subscriptions.length; i++) {
      subscription = subscriptions[i];

      console.log(subscription);

      if (!subscription.contract) {
        continue;
      }

      let allowance = await dai.allowance(
        subscription.subscriber.id,
        subscription.contract.id
      );

      let balance = await dai.balanceOf(subscription.subscriber.id);

      if (
        allowance.gte(subscription.value) &&
        balance.gte(subscription.value) &&
        subscription.status === "ACTIVE"
      ) {
        let _contract = new ethers.Contract(
          subscription.contract.id,
          SubscriptionV1.abi,
          account
        );
        try {
          await _contract.executeSubscription(subscription.hash);
        } catch (err) {
          console.log(err);
        }
      }
    }
  } catch {
    console.log("Fetch error");
  }

  setTimeout(execSubs, 15000);
}

setTimeout(execSubs, 5000);
