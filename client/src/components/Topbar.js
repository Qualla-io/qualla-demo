import React from "react";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { makeStyles } from "@material-ui/core/styles";
import Balances from "./Balances";

const useStyles = makeStyles((theme) => ({
  grow: {
    flex: 1,
  },
  toolbarButtons: {
    marginLeft: "auto",
  },
  title: {
    marginRight: theme.spacing(2),
  },
}));

export default function Topbar() {
  const classes = useStyles();
  return (
    <div className={classes.grow}>
      <AppBar style={{ margin: 0, background: "#000" }} position="fixed">
        <Toolbar>
          {/* <Balances /> */}
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );
}
