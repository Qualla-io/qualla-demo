import React from "react";
import heroimage from "../../../img/heroimg.jpg";
import { makeStyles } from "@material-ui/core/styles";
import CoverPhoto from "../../../components/CoverPhotos";

const useStyles = makeStyles((theme) => ({
  heroRoot: {
    width: "100%",
    overflow: "hidden",
    display: "block",
  },
  img: {
    width: "100%",
    overflow: "hidden",
  },
}));

export default function HeroImage({ userProps }) {
  const classes = useStyles();

  return (
    <div className={classes.heroRoot}>
      <img
        src={
          userProps?.coverPhoto !== null
            ? CoverPhoto(userProps.coverPhoto)
            : CoverPhoto(0)
        }
        alt=""
        className={classes.img}
      ></img>
    </div>
  );
}
