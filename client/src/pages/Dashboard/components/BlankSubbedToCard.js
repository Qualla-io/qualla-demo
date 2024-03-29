import React from "react";

import { cardStyles } from "./styles";
import { Avatar, Typography, Button } from "@material-ui/core";
import PriorityHighIcon from "@material-ui/icons/PriorityHigh";
import { Link } from "react-router-dom";

export default function BlankSubbedToCard() {
  const classes = cardStyles();
  return (
    <div className={classes.card}>
      <Avatar className={classes.avatar}>
        <PriorityHighIcon className={classes.icons} />
      </Avatar>
      <div className={classes.content}>
        <Typography variant="h5" align="center">
          No Subscriptions!
        </Typography>
      </div>
      {/* <div className={classes.content}>
    <Typography align="center">Mint your frist subscription:</Typography>
  </div> */}
      <Button
        component={Link}
        to={`/${process.env.REACT_APP_CREATOR_ADDRESS}`}
        variant="contained"
        color="secondary"
        className={classes.content}
      >
        find Creator
      </Button>
    </div>
  );
}
