import {
  AppBar,
  Hidden,
  IconButton,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import React from "react";
import { useQueryWithAccount } from "../../../hooks";
import { GET_USER_HEADER } from "../queries";

const useStyles = makeStyles((theme) => ({
  appbar: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.background.default,
  },
  container: {
    display: "flex",
    alignItems: "center"
  },
  spacer: {
    margin: "Auto",
  },
  user: {
    width: 275,

  },
}));

export default function TopBar({ openMenu }) {
  const classes = useStyles();
  let { data } = useQueryWithAccount(GET_USER_HEADER);
  return (
    <>
      <div className={classes.container}>
        <Hidden mdUp>
          <IconButton onClick={openMenu}>
            <MenuIcon />
          </IconButton>
        </Hidden>
        <div className={classes.spacer} />
        <Typography variant="h5" className={classes.user} noWrap>
          Welcome, {data?.user?.username}
        </Typography>
      </div>
    </>
  );
}
