import React from "react";

import { cardStyles } from "./styles";
import { Avatar, Button, Typography } from "@material-ui/core";
import AndroidIcon from "@material-ui/icons/Android";

import { gql, useReactiveVar, useMutation, useQuery } from "@apollo/client";
import { ethers } from "ethers";
import { PERMIT } from "../queries";
import {
  daiVar,
  accountVar,
  subscriptionVar,
  signerVar,
  ethVar,
} from "../../../cache";

import { signPermit } from "../utils";

export default function SubCard(props) {
  let account = useReactiveVar(accountVar);
  let dai = useReactiveVar(daiVar);
  let signer = useReactiveVar(signerVar);
  let subscriptionV1 = useReactiveVar(subscriptionVar);
  let eth = useReactiveVar(ethVar);
  const classes = cardStyles();
  let token = props.token;

  let [permit] = useMutation(PERMIT);

  async function _subscribe() {
    let subscriberData = {
      user: account,
      nonce: 0,
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
      ],
    };

    let signature = await signer._signTypedData(
      domain,
      creatorTypes,
      subscriberData
    );
  }

  async function _permit() {
    // move this to graph at some point
    let nonce = await dai.nonces(account);

    nonce = nonce.toString();

    // console.log(nonce);

    // console.log(subscriptionV1.address);
    // console.log(dai.address);

    var message = {
      holder: account,
      spender: subscriptionV1.address,
      nonce: parseInt(0),
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

    console.log(verAdd);

    // const res = await signPermit(eth, message, dai.address);

    // console.log(res);

    await permit({ variables: { userID: account, signature, nonce } });
  }

  return (
    <div className={classes.card}>
      <Avatar className={classes.avatar}>
        <AndroidIcon className={classes.icons} />
      </Avatar>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          Nickname
        </Typography>
      </div>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          <b>${token?.paymentValue}</b>
        </Typography>
        <Typography display="inline">{` `}Dai/mo.</Typography>
      </div>
      <Button
        variant="contained"
        color="secondary"
        className={classes.content}
        onClick={_permit}
      >
        Subscribe
      </Button>
    </div>
  );
}
