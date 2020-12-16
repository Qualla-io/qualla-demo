import React from "react";

import { cardStyles } from "./styles";
import { Avatar, Button, Typography } from "@material-ui/core";
import AndroidIcon from "@material-ui/icons/Android";

export default function SubbedToCard(props) {
  let token = props.token;
  const classes = cardStyles();
  return (
    <div className={classes.card}>
      <Avatar className={classes.avatar}>
        <AndroidIcon className={classes.icons} />
      </Avatar>
      <div className={classes.content}>
        <Typography display="inline">Creator:</Typography>
      </div>
      <div>
        <Typography variant="h5" display="inline">
          {token?.creator?.id.slice(0, 5)}...{token?.creator?.id.slice(-5)}
        </Typography>
      </div>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          <b>${token?.baseToken?.paymentValue}</b>
        </Typography>
        <Typography display="inline">{` `}Dai/mo.</Typography>
      </div>
      <Button variant="contained" color="secondary" className={classes.content}>
        View
      </Button>
    </div>
  );
}
