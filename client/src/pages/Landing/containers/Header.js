import React from "react";

import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
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
  },
}));

export default function Header() {
  const classes = useStyles();
  let account = useReactiveVar(accountVar);
  return (
    <Grid container className={classes.header}>
      <Grid item>
        <AccountCircleRoundedIcon className={classes.icon} />
      </Grid>
      <Grid item>
        <Typography>{account}</Typography>
      </Grid>
      <Grid item>
        <HeaderCard />
      </Grid>
    </Grid>
  );
}
