import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Header from "../components/Home/Header";
import IncomeCard from "../components/Home/IncomeCard";
import { Grid, Hidden } from "@material-ui/core";
import Messages from "../components/Home/Messages";
import Transactions from "../components/Home/Transactions";

const useStyles = makeStyles((theme) => ({
  main: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
  },
}));

export default function DashboardHome() {
  const classes = useStyles();
  return (
    <Grid container spacing={2} className={classes.main}>
      <Grid item xs={12}>
        <Header />
      </Grid>
      <Grid item xs={12} lg={8}>
        <IncomeCard />
      </Grid>
      <Grid item xs={12} lg={4}>
        <Messages />
      </Grid>
      <Hidden smDown>
        <Grid item xs={12}>
          <Transactions />
        </Grid>
      </Hidden>
    </Grid>
  );
}
