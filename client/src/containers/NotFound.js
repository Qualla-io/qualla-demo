import { Typography, makeStyles } from "@material-ui/core";
import React from "react";
import NotFoundSVG from "../img/NotFound.svg";

const useStyles = makeStyles((theme) => ({
  div: {
    display: "flex",
    flexDirection: "Column",
    justify: "center",
    alignItems: "center",
  },
  title: { marginTop: theme.spacing(3) },
  svg: {
    width: "50%",
    marginTop: theme.spacing(8),
  },
}));

export default function NotFound() {
  const classes = useStyles();
  return (
    <div className={classes.div}>
      <Typography variant="h4" className={classes.title}>
        Still painting, please come back later!
      </Typography>
      <NotFoundSVG className={classes.svg} />
    </div>
  );
}
