import { useReactiveVar } from "@apollo/client";
import {
  Button,
  Hidden,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import React from "react";
import { ethVar } from "../../../cache";
import { initWeb3 } from "../../../components/Web3Dialog";
import { useQueryWithAccount } from "../../../hooks";
import { GET_USER_HEADER } from "../queries";

const useStyles = makeStyles((theme) => ({
  appbar: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.background.default,
  },
  container: {
    display: "flex",
    alignItems: "center",
  },
  spacer: {
    margin: "Auto",
  },
  user: {
    maxWidth: 275,
  },
  btn: {
    backgroundColor: theme.palette.tertiary.main,
  },
}));

export default function TopBar({ openMenu }) {
  const classes = useStyles();
  let eth = useReactiveVar(ethVar);
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
        {!eth ? (
          <Button
            onClick={initWeb3}
            className={classes.btn}
            variant="contained"
            size="large"
          >
            Connect Wallet
          </Button>
        ) : (
          <Typography variant="h5" className={classes.user} noWrap>
            Welcome, {data?.user?.username}
          </Typography>
        )}
      </div>
    </>
  );
}
