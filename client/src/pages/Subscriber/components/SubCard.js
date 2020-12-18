import React from "react";

import { cardStyles } from "./styles";
import { Avatar, Button, Typography } from "@material-ui/core";
import AndroidIcon from "@material-ui/icons/Android";

export default function SubCard(props) {
  const classes = cardStyles();
  let token = props.token;

  return (
    <div className={classes.card}>
      <Avatar className={classes.avatar}>
        <AndroidIcon className={classes.icons} />
      </Avatar>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          Nickname
        </Typography>
      </div>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          <b>${token?.paymentValue}</b>
        </Typography>
        <Typography display="inline">{` `}Dai/mo.</Typography>
      </div>
      <Button variant="contained" color="secondary" className={classes.content}>
        Subscribe
      </Button>
    </div>
  );
}
