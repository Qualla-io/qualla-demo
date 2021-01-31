import { makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => ({
  default: {
    width: 320,
    // paddingBottom: theme.spacing(2),
  },
  div: {
    flexGrow: 1,
  },
}));

export default function NFTgifs({ customProps, i }) {
  const classes = useStyles();
  const gifs = [
    <img
      src="https://media.giphy.com/media/eoxomXXVL2S0E/giphy.gif"
      alt="winning"
      className={customProps ? customProps : classes.default}
    />,
    <img
      src="https://media.giphy.com/media/Ogak8XuKHLs6PYcqlp/giphy.gif"
      alt="moon"
      className={customProps ? customProps : classes.default}
    />,
    <img
      src="https://media.giphy.com/media/JTV3ciE3YTDycJXhmq/giphy.gif"
      alt="eth"
      className={customProps ? customProps : classes.default}
    />,
    <img
      src="https://media.giphy.com/media/J7jsbfcJ2O5eo/giphy.gif"
      alt="doit"
      className={customProps ? customProps : classes.default}
    />,
    <img
      src="https://media.giphy.com/media/v0u7eU0nSmOJ0hGf6n/giphy.gif"
      alt="moreEth"
      className={customProps ? customProps : classes.default}
    />,
  ];

  //   return <div className={classes.div}>{gifs[i]}</div>;
  return <>{gifs[i]}</>;
}

export const gifLength = 4;
