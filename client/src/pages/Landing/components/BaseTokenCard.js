import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Typography } from "@material-ui/core";
import AndroidIcon from "@material-ui/icons/Android";

const useStyles = makeStyles((theme) => ({
  content: {},
  card: {
    display: "flex",
    flexDirection: "column",
    background: "#FFFFFF",
    border: "3px solid #000000",
    boxSizing: "border-box",
    boxShadow: "10px 10px 4px rgba(0, 0, 0, 0.25)",
    borderRadius: "30px",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4),
    marginRight: theme.spacing(4),
    marginBottom: theme.spacing(2),
  },
  avatar: {
    height: theme.spacing(10),
    width: theme.spacing(10),
    backgroundColor: theme.palette.secondary.main,
  },
  icons: {
    fontSize: "3em",
  },
}));

export default function BaseTokenCard(props) {
  const classes = useStyles();
  let token = props.token;

  return (
    <div className={classes.card}>
      <Avatar className={classes.avatar}>
        <AndroidIcon className={classes.icons} />
      </Avatar>
      <div>
        <Typography variant="h6">${token?.paymentValue}</Typography>
        <Typography>Dai/mo.</Typography>
      </div>
      <div>
        <Typography variant="h6">{token?.activeTokens?.length}</Typography>
        <Typography>Active Subscribers</Typography>
      </div>
    </div>
  );
}
