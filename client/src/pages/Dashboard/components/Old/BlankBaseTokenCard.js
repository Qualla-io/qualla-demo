import React from "react";
import { Link } from "react-router-dom";

import { cardStyles } from "../styles";
import { Avatar, Typography, Button } from "@material-ui/core";
import PriorityHighIcon from "@material-ui/icons/PriorityHigh";

export default function BlankBaseTokenCard() {
  const classes = cardStyles();
  return (
    <div className={classes.card}>
      <Avatar className={classes.avatar}>
        <PriorityHighIcon className={classes.icons} />
      </Avatar>
      <div className={classes.content}>
        <Typography variant="h5" align="center">
          No Active Subscriptions!
        </Typography>
      </div>
      {/* <div className={classes.content}>
        <Typography align="center">Mint your frist subscription:</Typography>
      </div> */}
      <Button
        component={Link}
        to="/mint"
        variant="contained"
        color="secondary"
        className={classes.content}
      >
        Mint Now
      </Button>
    </div>
  );
}
