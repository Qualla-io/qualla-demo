import React, { useState, useEffect } from "react";
import { BigNumber } from "bignumber.js";
import Grid from "@material-ui/core/Grid";

import { makeStyles } from "@material-ui/core/styles";

import { useReactiveVar } from "@apollo/client";
import { accountVar } from "../../../cache";
import { useQueryWithAccountNetwork } from "../../../hooks";
import HeaderCard from "../components/HeaderCard";

import { GET_USER_OVERVIEW } from "../queries";

const useStyles = makeStyles((theme) => ({
  header: {
    marginTop: theme.spacing(6),
    width: "100%",
    height: "100%",
    margin: 0,
  },
}));

export default function Header() {
  const classes = useStyles();
  let [value, setValue] = useState(0);
  let account = useReactiveVar(accountVar);
  let { data } = useQueryWithAccountNetwork(GET_USER_OVERVIEW);

  useEffect(() => {
    if (data?.user?.subscribers) {
      let total = new BigNumber(0);
      for (var i = 0; i < data.user.subscribers.length; i++) {
        total = total.plus(data.user.subscribers[i]?.baseToken?.paymentValue);
      }
      // unhard code in future
      setValue(total.multipliedBy(95).dividedBy(100).toFixed());
    }
  }, [data]);

  return (
    <Grid container className={classes.header} spacing={10}>
      <Grid item sm>
        <HeaderCard
          description="Subscribers"
          value={data?.user?.subscribers?.length}
        />
      </Grid>
      <Grid item sm>
        <HeaderCard description="$ Dai/Mo." value={value} />
      </Grid>
      <Grid item sm>
        <HeaderCard
          description="Active Tiers"
          value={data?.user?.baseTokens?.length}
        />
      </Grid>
    </Grid>
  );
}
