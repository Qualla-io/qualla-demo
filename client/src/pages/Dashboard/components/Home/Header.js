import React, { useState, useEffect } from "react";
import { BigNumber } from "bignumber.js";
import Grid from "@material-ui/core/Grid";

import { makeStyles } from "@material-ui/core/styles";


import { useQueryWithAccountNetwork } from "../../../../hooks";

import { GET_USER_OVERVIEW } from "./queries";
import { Card, CardContent, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  header: {
    // marginTop: theme.spacing(6),
    // width: "100%",
    // height: "100%",
    // margin: 0,
  },
  card: {
    display: "flex",
    flexDirection: "Column",
    marginLeft: theme.spacing(3),
    padding: theme.spacing(2),
  },
  line: {
    borderLeft: "1px solid black",
    height: "50%",
  },
  title: {
    marginBottom: -theme.spacing(4),
  },
}));

export default function Header() {
  const classes = useStyles();
  let [value, setValue] = useState(0);
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
      value: data?.user?.subscribers ? data?.user?.subscribers?.length : "0",
    },
    { description: "$Dai/Mo.", value: value },
    {
      description: "Active Tiers",
      value: data?.user?.baseTokens ? data?.user?.baseTokens?.length : "0",
    },
  ];

  return (
    <Card className={classes.header}>
      {/* <CardHeader title="Overview" className={classes.title} /> */}
      <Grid component={CardContent} container item lg>
        {cardData.map((item, index) => (
          <React.Fragment key={index}>
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
          </React.Fragment>
        ))}
      </Grid>
    </Card>
  );
}
