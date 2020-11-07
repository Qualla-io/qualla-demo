import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {useDispatch} from "react-redux";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

import TierCard from "./TierCard";

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

  function onSubscribe() {}

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
