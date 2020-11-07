import React from "react";
import heroimage from "../../../img/heroimg.jpg";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  heroRoot: {
    height: "45vh",
    width: "100vw",
    overflow: "hidden",
    display: "block"
  },
  img: {
    width: "100vw",
    overflow: "hidden",
  },
}));

export default function HeroImage() {
  const classes = useStyles();

  return (
    <div className={classes.heroRoot}>
      <img src={heroimage} className={classes.img}></img>
    </div>
  );
}
