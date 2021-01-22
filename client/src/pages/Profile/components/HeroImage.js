import React from "react";
import heroimage from "../../../img/heroimg.jpg";
import {makeStyles} from "@material-ui/core/styles";
import CoverPhoto from "../../../components/CoverPhotos";

const useStyles = makeStyles((theme) => ({
  heroRoot: {
    height: "45vh",
    width: "100%",
    overflow: "hidden",
    display: "block",
  },
  img: {
    width: "100%",
    overflow: "hidden",
  },
}));

export default function HeroImage({userProps}) {
  const classes = useStyles();

  return (
    <div className={classes.heroRoot}>
      <img src={userProps?.coverPhoto? CoverPhoto(userProps.coverPhoto) : heroimage} alt="" className={classes.img}></img>
    </div>
  );
}
