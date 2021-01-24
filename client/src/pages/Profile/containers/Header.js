import React from "react";

import CreatorAvatar from "../components/CreatorAvatar";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import HeroImage from "../components/HeroImage";

const useStyles = makeStyles((theme) => ({
  heading: {
    marginTop: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    textAlign: "center",
    maxWidth: "100%",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up("lg")]: {
      maxWidth: "70%",
    },
    wordWrap: "break-word",
  },
  headderDiv: {
    display: "flex",
    flexDirection: "Column",
    // justifyContent: "center",
    alignItems: "center",
    height: "70vh",
    width: "100%",
  },
}));

export default function Header({ userProps }) {
  const classes = useStyles();

  return (
    <div className={classes.headderDiv}>
      <HeroImage userProps={userProps} />
      <CreatorAvatar userProps={userProps} />
      <Typography variant="h2" className={classes.heading}>
        {userProps?.username || "USERNAME"}
      </Typography>
      <Typography className={classes.subtitle}>
        {userProps?.description}
      </Typography>
    </div>
  );
}
