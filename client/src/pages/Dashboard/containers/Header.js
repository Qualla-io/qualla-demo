import React, { useState, useEffect } from "react";
import { BigNumber } from "bignumber.js";
import Grid from "@material-ui/core/Grid";

import { makeStyles } from "@material-ui/core/styles";

import { useReactiveVar } from "@apollo/client";
import { accountVar } from "../../../cache";
import { useQueryWithAccountNetwork } from "../../../hooks";
import HeaderCard from "../components/HeaderCard";

import { GET_USER_OVERVIEW } from "../queries";
import { Card, CardContent, Divider, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  header: {
    marginTop: theme.spacing(6),
    width: "100%",
    height: "100%",
    margin: 0,
    display: "flex",
  },
  card: {
    display: "flex",
    flexDirection: "Column",
    marginLeft: theme.spacing(3),
    padding: theme.spacing(3),
  },
  line: {
    borderLeft: "1px solid black",
    height: "50%",
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

  var cardData = [
    {
      description: "Subscribers",
      value: data?.user?.subscribers ? data?.user?.subscribers?.length : "--",
    },
    { description: "$Dai/Mo.", value: value },
    {
      description: "Active Tiers",
      value: data?.user?.baseTokens ? data?.user?.baseTokens?.length : "--",
    },
  ];

  return (
    <Card className={classes.header}>
      <Grid component={Grid} container item lg>
        {cardData.map((item, index) => (
          <>
            <Grid item xs className={classes.card}>
              <Typography>{item.description}</Typography>
              <Typography variant="h4">
                <b>{item.value}</b>
              </Typography>
            </Grid>
            {index === cardData.length - 1 ? null : (
              <Grid
                item
                style={{
                  display: "flex",
                  flexDirection: "Column",
                  justifyContent: "center",
                }}
              >
                <div className={classes.line} />
              </Grid>
            )}
          </>
        ))}
      </Grid>
    </Card>
  );
}
