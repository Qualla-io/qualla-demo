import React from "react";

import { cardStyles } from "./styles";
import { Avatar, Button, Typography } from "@material-ui/core";
import AndroidIcon from "@material-ui/icons/Android";

import { gql, useReactiveVar, useMutation, useQuery } from "@apollo/client";
import { ethers } from "ethers";
import { PERMIT, SUBSCRIBE, GET_USER_NONCE } from "../queries";
import { daiVar, accountVar, subscriptionVar, signerVar } from "../../../cache";
import { useQueryWithAccount } from "../../../hooks";
import AvatarIcons from "../../../components/AvatarIcons";

export default function SubCard(props) {
  let account = useReactiveVar(accountVar);
  let dai = useReactiveVar(daiVar);
  let signer = useReactiveVar(signerVar);
  let subscriptionV1 = useReactiveVar(subscriptionVar);
  let { data } = useQueryWithAccount(GET_USER_NONCE);

  const classes = cardStyles();
  let token = props.token;
  let [permit] = useMutation(PERMIT);
  let [subscribe] = useMutation(SUBSCRIBE);

  async function _subscribe() {
    let subscriberData = {
      user: account,
      nonce: data?.user?.nonce,
      action: "subscribe",
    };

    let domain = {
      name: "Qualla Subscription",
      version: "1",
      chainId: 31337,
      verifyingContract: subscriptionV1.address,
    };

    let creatorTypes = {
      User: [
        { name: "user", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "action", type: "string" },
      ],
    };

    let signature = await signer._signTypedData(
      domain,
      creatorTypes,
      subscriberData
    );

    subscribe({
      variables: { userID: account, baseTokenID: token?.id, signature },
      update(cache, { data: subscribe }) {

        // This causes a refetch somewhere and wipes out the cached ref
        // cache.modify({
        //   id: cache.identify({
        //     id: account.toLowerCase(),
        //     __typename: "User",
        //   }),
        //   fields: {
        //     subscriptions(exsistingSubscriptionRefs = [], { readField }) {
        //       return [subscribe];
        //     },
        //   },
        //   broadcast: false,
        // });

        cache.modify({
          id: cache.identify({
            id: account.toLowerCase(),
            __typename: "User",
          }),
          fields: {
            nonce(cachedNonce) {
              return cachedNonce + 1;
            },
          },
        });
      },
    });
  }

  async function _permit() {
    // move this to graph at some point
    let nonce = await dai.nonces(account);

    nonce = nonce.toString();

    var message = {
      holder: account,
      spender: subscriptionV1.address,
      nonce,
      expiry: parseInt(0),
      allowed: true,
    };

    let domain = {
      name: "Dai Stablecoin",
      version: "1",
      chainId: 31337,
      verifyingContract: dai.address.toLowerCase(),
    };

    let permitTypes = {
      Permit: [
        {
          name: "holder",
          type: "address",
        },
        {
          name: "spender",
          type: "address",
        },
        {
          name: "nonce",
          type: "uint256",
        },
        {
          name: "expiry",
          type: "uint256",
        },
        {
          name: "allowed",
          type: "bool",
        },
      ],
    };

    let signature = await signer._signTypedData(domain, permitTypes, message);

    let verAdd = ethers.utils.verifyTypedData(
      domain,
      permitTypes,
      message,
      signature
    );

    await permit({ variables: { userID: account, signature, nonce } });
  }

  async function handleSub() {
    let allowance = await dai.allowance(account, subscriptionV1.address);

    if (!allowance.gt(0)) {
      await _permit();
    }

    await _subscribe();
  }

  return (
    <div className={classes.card}>
      <Avatar className={classes.avatar}>
        <AvatarIcons customProps={classes.icons} i={token.avatarID} />
      </Avatar>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          {token.title}
        </Typography>
      </div>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          <b>
            $
            {ethers.utils
              .formatEther(token?.paymentValue?.toString())
              .toString()}
          </b>
        </Typography>
        <Typography display="inline">{` `}Dai/mo.</Typography>
      </div>
      <Button
        variant="contained"
        color="secondary"
        className={classes.content}
        onClick={handleSub}
      >
        Subscribe
      </Button>
    </div>
  );
}
