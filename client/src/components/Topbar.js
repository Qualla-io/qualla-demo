import React from "react";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import { Container } from "@material-ui/core";



// const marg = 14;

const useStyles = makeStyles((theme) => ({
  appbar: {
    direction: "row",
  },
  grow: {
    // flexGrow: 1,
    margin: "auto",
    // display: "flex",
    // direction: "row",
    // justifyContent: "center",
    // alignItems: "center",
  },
  title: {
    // marginRight: theme.spacing(4),
    // marginLeft: theme.spacing(marg),
    textDecoration: "none",
  },
  pages: {
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
    textDecoration: "none",
  },
  btn: {
    // marginRight: theme.spacing(marg),
    borderRadius: 25,
  },
  center: {
    direction: "row",
  },
  topDiv: {
    display: "flex",
    flexDirection: "row",
  },
}));

export default function Topbar() {
  const classes = useStyles();
  return (
    <React.Fragment>
      <AppBar style={{ margin: 0, background: "#000" }} position="fixed">
        <Toolbar>
          <Container>
            <div className={classes.topDiv}>
              <Typography
                component={Link}
                to={"/"}
                variant="h5"
                className={classes.title}
                color="inherit"
              >
                Qualla
              </Typography>
              <div className={classes.grow}>
               
              </div>
              <Typography
                component={Link}
                to={"/"}
                variant="h6"
                className={classes.pages}
                color="inherit"
              >
                Dashboard
              </Typography>
              <Typography
                component={Link}
                to={"/"}
                variant="h6"
                className={classes.pages}
                color="inherit"
              >
                Join Waitlist
              </Typography>
            </div>
          </Container>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </React.Fragment>
  );
}
