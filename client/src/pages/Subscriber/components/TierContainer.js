import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {useDispatch} from "react-redux";
import {useSnackbar} from "notistack";
import axios from "axios";
import {ethers} from "ethers";
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
  const {enqueueSnackbar} = useSnackbar();

  const dispatch = useDispatch();

  async function onSubscribe(value) {
    const Dai = web3State.Dai;
    const account = web3State.account;
    const signer = web3State.signer;
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

    enqueueSnackbar("Permit Request Sent", {
      variant: "success",
    });

    axios
      .post(`http://localhost:8080/permit/`, {
        res,
        message,
        account,
        contract: subsciberState.contract.address,
      })
      .then((ans) => {
        enqueueSnackbar(ans.data, {
          variant: "success",
        });
      })
      .catch((err) => {
        enqueueSnackbar("Permit processing error", {
          variant: "error",
        });
      });

    let contractInstance = subsciberState.contractInstance;

    value = ethers.utils.parseUnits(value.toString(), "ether").toString();

    let hash = await contractInstance.getSubscriptionHash(
      account,
      value,
      Dai.address,
      0, //nonce
      0 //status: ACTIVE
    );

    const signedHash = await signer.signMessage(ethers.utils.arrayify(hash));

    axios
      .post(`http://localhost:8080/subscribe/`, {
        hash,
        signedHash,
        account,
        value,
        contract: contractInstance.address,
      })
      .then((res) => {})
      .catch((err) => {
        enqueueSnackbar("Subscription processing error", {
          variant: "error",
        });
      });
  }

  return (
    <Grid item container spacing={2} className={classes.card} justify="center">
      {subsciberState.contract.tiers.map((tier, i) => (
        <Grid item xs={12} md={3} lg={3} key={i}>
          <TierCard tier={tier} onSubscribe={onSubscribe} />
        </Grid>
      ))}
    </Grid>
  );
}
