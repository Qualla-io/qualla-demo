import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Topbar from "../components/Topbar.js";
// import MainSection from "./MainSection.js";
import Footer from "./Footer.js";
import FABspeeddial from "../components/FABspeeddial.js";
import MyBalance from "../components/MyBalance.js";
import Web3Modal from "../components/Web3Dialog.js";
import SideDrawer from "../pages/Dashboard/components/SideDrawer.js";

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
