import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
// import JWB from "../img/JWB.png";
import FA18 from "../../../img/FA18.jpg";
import AvatarIcons from "../../../components/AvatarIcons";
import UserAvatars from "../../../components/UserAvatars";

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
    border: "4px solid white",
    backgroundColor: theme.palette.secondary.main,
  },
}));

export default function CreatorAvatar({ userProps }) {
  const classes = useStyles();
  return (
    <div className={classes.avatarRoot}>
      <Avatar className={classes.avatar}>
        <UserAvatars i={userProps?.avatar} />
      </Avatar>
    </div>
  );
}
