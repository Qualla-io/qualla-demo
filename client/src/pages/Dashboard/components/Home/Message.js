import { Typography, makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => ({
  msg: {
    marginTop: theme.spacing(1),
  },
  spacer: {
    paddingBottom: theme.spacing(1),
    borderBottom: "1px solid black",
    width: "50%",
    marginLeft: "25%",
  },
  content: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
}));

export default function Message({ title, body }) {
  const classes = useStyles();
  return (
    <div className={classes.msg}>
      <Typography variant="h6">
        <b>{title}</b>
      </Typography>
      <Typography className={classes.content}>
        {body}
      </Typography>
      <div className={classes.spacer} />
    </div>
  );
}
