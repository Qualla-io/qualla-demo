import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
// import JWB from "../img/JWB.png";
import FA18 from "../../../img/FA18.jpg"

const avatarSize = "150px";

const useStyles = makeStyles((theme) => ({
  avatarRoot: {
    display: "flex",
    justifyContent: "center",
    marginTop: -100,
  },
  avatar: {
    zIndex: 1,
    width: avatarSize,
    height: avatarSize,
    border: '4px solid white'
  },
}));

export default function CreatorAvatar() {
  const classes = useStyles();
  return (
    <div className={classes.avatarRoot}>
      <Avatar src={FA18} className={classes.avatar} />

    </div>
  );
}
