import React from "react";

import { makeStyles } from "@material-ui/core/styles";

import Header from "./containers/Header";
import SubTokens from "./containers/SubTokens";
import SubbedTo from "./containers/SubbedTo";
import IncomeCard from "./components/IncomeCard";

const useStyles = makeStyles((theme) => ({
  main: {
    display: "flex",
    flexDirection: "Column",
  },
}));

export default function Landing() {
  const classes = useStyles();
  return (
    <div className={classes.main}>
      <Header />
      <IncomeCard />
      {/* <SubTokens /> */}
      {/* <SubbedTo /> */}
    </div>
  );
}
