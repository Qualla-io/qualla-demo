import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {useDispatch} from "react-redux";

import axios from "axios";
import {Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

import TierCard from "./TierCard";

import {signPermit} from "../utils";

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2),
    justify: "center",
    alignItems: "center",
  },
}));

export default function TierContainer() {
  const classes = useStyles();
  const web3State = useSelector((state) => state.Web3Reducer);
  const subsciberState = useSelector((state) => state.SubscriberReducer);

  const dispatch = useDispatch();

  async function onSubscribe() {
    const Dai = web3State.Dai;
    const account = web3State.account;
    let nonce = await Dai.nonces(account);

    nonce = nonce.toString();

    var message = {
      holder: account,
      spender: subsciberState.contract.address,
      allowed: true,
      nonce,
      expiry: 0,
    };

    const res = await signPermit(web3State.eth, message, Dai.address);

    axios.post(`http://localhost:8080/permit/`, {
      res,
      message,
      account,
      contract: subsciberState.contract.address
    });
  }

  return (
    <Grid item container spacing={2} className={classes.card} justify="center">
      {subsciberState.contract.tiers.map((tier, i) => (
        <Grid item xs={12} md={6} lg={3} key={i}>
          <TierCard tier={tier} onSubscribe={onSubscribe} />
        </Grid>
      ))}
    </Grid>
  );
}
