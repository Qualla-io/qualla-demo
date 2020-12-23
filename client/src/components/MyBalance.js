import React from "react";

import { Card, CardContent, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import UserBalance from "./UserBalance";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    zIndex: 1,
    position: "fixed",
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    padding: theme.spacing(2),
    background: "#FFFFFF",
    border: "3px solid #000000",
    boxSizing: "border-box",
    boxShadow: "5px 5px 2px rgba(0, 0, 0, 0.25)",
    borderRadius: "10px",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    spacing: theme.spacing(3),
  },

  underline: {
    textDecoration: "underline",
  },
}));

export default function MyBalance() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography gutterBottom variant="h6">
        Balance:
      </Typography>
      <UserBalance />
    </div>
  );
}
