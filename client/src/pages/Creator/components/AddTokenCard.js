import React from "react";

import { cardStyles } from "./styles";

import { Avatar, Typography, Button } from "@material-ui/core";
import AddBoxIcon from "@material-ui/icons/AddBox";

export default function AddTokenCard(props) {
  const classes = cardStyles();

  return (
    <div
      className={classes.newCard}
      onClick={props.customOnClick}
      style={{ cursor: "pointer" }}
    >
      <AddBoxIcon className={classes.newIcon} />
      <Typography variant="h4">Mint Another</Typography>
    </div>
  );
}
