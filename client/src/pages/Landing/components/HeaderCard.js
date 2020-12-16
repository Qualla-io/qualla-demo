import React, { useEffect, useState } from "react";

import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";

import { useReactiveVar, gql } from "@apollo/client";
import { accountVar } from "../../../cache";
import { useQueryWithAccount } from "../../../hooks";
import { CardContent, Paper, Typography } from "@material-ui/core";

const GET_USER_OVERVIEW = gql`
  query gerUserOverview($id: ID!) {
    user(id: $id) {
      id
      nonce
      subscribers {
        id
        baseToken {
          id
          paymentValue
        }
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  content: {},
  card: {
    padding: theme.spacing(4),
    borderColor: "#000000",
    borderWidth: "3px",
    borderRadius: 56,
    width: "30em",
    height: "10em",
    boxShadow: "100px 100px 4px 0px #000000 25%",
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
  let account = useReactiveVar(accountVar);
  let [value, setValue] = useState(0);
  const { error, loading, data } = useQueryWithAccount(GET_USER_OVERVIEW);

  useEffect(() => {
    if (data?.user) {
      let total = 0;
      for (var i = 0; i < data.user.subscribers.length; i++) {
        total += data.user.subscribers[i].baseToken.paymentValue;
      }
      setValue(total);
    }
  }, [data]);

  return (
    <Paper className={classes.card} variant="outlined" elevation={4} >
      <Grid container justify="center" alignItems="spaceBetween">
        <Grid item className={classes.subs} xs>
          <div>
            <Typography variant="h4">
              {data?.user ? data.user.subscribers.length : 0}
            </Typography>
            <Typography variant="subtitle1">Subscribers</Typography>
          </div>
        </Grid>
        <Grid item xs className={classes.value}>
          <div>
            <Typography variant="h4">${value}</Typography>
            <Typography variant="subtitle1">Dai/month</Typography>
          </div>
        </Grid>
      </Grid>
    </Paper>
  );
}
