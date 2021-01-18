import React from "react";

import { makeStyles } from "@material-ui/core/styles";

import Header from "./containers/Header";
import SubTokens from "./containers/SubTokens";
import SubbedTo from "./containers/SubbedTo";

const useStyles = makeStyles((theme) => ({
  main: {
    display: "flex",
    direction: "column",
  },
}));

export default function Landing() {
  const classes = useStyles();
  return (
    <div className={classes.main}>
      <Header />
      {/* <SubTokens /> */}
      {/* <SubbedTo /> */}
    </div>
  );
}
