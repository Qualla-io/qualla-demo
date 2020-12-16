import React from "react";

import Grid from "@material-ui/core/Grid";
import { Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AccountCircleRoundedIcon from "@material-ui/icons/AccountCircleRounded";

import { useReactiveVar } from "@apollo/client";
import { accountVar } from "../../../cache";
import HeaderCard from "../components/HeaderCard";


const useStyles = makeStyles((theme) => ({
  icon: {
    fontSize: "10em",
  },
  header: {
    marginTop: theme.spacing(8),
    width: "100%",
    height: "100%",
    position: "relative",
  },
  card: {
    // marginRight: -10,
  },
  username: {
    display: "flex",
    flexDirection: "column",
    justifyItems: "center",
    height: "100%",
    position: "absoulute",
  },
}));

export default function Header() {
  const classes = useStyles();
  let account = useReactiveVar(accountVar);
  return (
    <Grid
      container
      className={classes.header}
      justify="center"
      alignItems="center"
    >
      <Grid item>
        <AccountCircleRoundedIcon className={classes.icon} />
      </Grid>
      <Grid item className={classes.username}>
        <Typography variant="h4">
          <b>Username</b>
        </Typography>
        <Typography variant="subtitle1">{account}</Typography>
        <Link component={Typography}>edit</Link>
      </Grid>
      <Grid item xs />
      <Grid item>
        <HeaderCard className={classes.card} />
      </Grid>
    </Grid>
  );
}
