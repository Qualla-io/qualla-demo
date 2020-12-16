import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Topbar from "../components/Topbar.js";
// import Balances from "../components/Balances.js";
import MainSection from "./MainSection.js";

const useStyles = makeStyles((theme) => ({
  root: {
    // display: "flex",
    // flexFlow: "column",
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
}));

export default function Layout(props) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Topbar />
      {/* <Balances /> */}
      <MainSection>{props.children}</MainSection>
    </div>
  );
}
