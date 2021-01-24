import {

  makeStyles,

  Typography,
} from "@material-ui/core";
// import MenuIcon from "@material-ui/icons/Menu";
import React from "react";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  spacer: {
    margin: "Auto",
  },
  user: {
    marginLeft: theme.spacing(3),
    textDecoration: "none",
    color: "black",
  },
  title: {
    textDecoration: "none",
    color: "black",
    // marginLeft: theme.spacing(4)
  },
}));

export default function TopBar() {
  const classes = useStyles();
  // let { data } = useQueryWithAccount(GET_USER_HEADER);
  return (
    <>
      <div className={classes.container}>
        <Typography
          variant="h4"
          className={classes.title}
          component={Link}
          to="/"
        >
          <b>Qualla</b>
        </Typography>
        <div className={classes.spacer} />
        <Typography
          component={Link}
          to="/dashboard"
          variant="h5"
          className={classes.user}
        >
          Dashboard
        </Typography>
        <Typography variant="h5" className={classes.user}>
          Waitlist
        </Typography>
      </div>
    </>
  );
}
