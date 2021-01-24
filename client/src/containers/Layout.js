import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import FABspeeddial from "../components/FABspeeddial.js";
import Web3Modal from "../components/Web3Dialog.js";


const useStyles = makeStyles((theme) => ({
  root: {
    // display: "flex",
    // flexFlow: "column",
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    main: {
      display: "flex",
      direction: "column",
    },
    grow: {
      flexGrow: 1,
    },
  },
}));

export default function Layout(props) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Web3Modal />

      {props.children}

      {/* <Footer /> */}
      <FABspeeddial />
    </div>
  );
}
