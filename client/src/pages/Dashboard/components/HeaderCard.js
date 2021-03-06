import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";

import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";

// import { useReactiveVar } from "@apollo/client";
import { GET_USER_OVERVIEW } from "../queries";
// import { accountVar } from "../../../cache";
import { useQueryWithAccount } from "../../../hooks";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  content: {},
  card: {
    display: "flex",
    flexDirection: "Row",
    height: "10em",
    width: "30em",
    background: "#FFFFFF",
    border: "3px solid #000000",
    boxSizing: "border-box",
    boxShadow: "10px 10px 4px rgba(0, 0, 0, 0.25)",
    borderRadius: "30px",
  },
  subs: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRight: "3px solid black",
  },
  value: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function HeaderCard() {
  const classes = useStyles();
  // let account = useReactiveVar(accountVar);
  let [value, setValue] = useState(0);
  const { data } = useQueryWithAccount(GET_USER_OVERVIEW);

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
    <div className={classes.card}>
      <Grid container justify="center" alignItems="spaceBetween">
        <Grid item className={classes.subs} xs>
          <div>
            <Typography variant="h4">
              {data?.user?.subscribers ? data.user.subscribers.length : 0}
            </Typography>
            <Typography variant="subtitle1">Subscribers</Typography>
          </div>
        </Grid>
        <Grid item xs className={classes.value}>
          <Tooltip
            arrow
            title="5% platfrom fee taken from subscriptions"
            placement="top"
          >
            <div>
              <Typography variant="h4">
                ${ethers.utils.formatEther(value.toString()).toString()}
              </Typography>
              <Typography variant="subtitle1">Dai/month</Typography>
            </div>
          </Tooltip>
        </Grid>
      </Grid>
    </div>
  );
}
