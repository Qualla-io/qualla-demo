import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { cardStyles } from "./styles";
import {  Typography, Button } from "@material-ui/core";
import LoyaltyIcon from "@material-ui/icons/Loyalty";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  icon: {
    fontSize: "10em",
    color: theme.palette.secondary.main,
  },
}));

export default function FindCreatorCard() {
  const classes = cardStyles();
  const _classes = useStyles();
  return (
    <div className={classes.card}>
      <LoyaltyIcon className={_classes.icon} />
      <div className={classes.content}>
        <Typography variant="h5" align="center">
          Find your next favorite creator!
        </Typography>
      </div>
      <div style={{ margin: "auto" }} />
      <Button
        to={`/${process.env.REACT_APP_CREATOR_ADDRESS}`}
        component={Link}
        variant="contained"
        color="secondary"
        className={classes.btn}
      >
        search
      </Button>
    </div>
  );
}
