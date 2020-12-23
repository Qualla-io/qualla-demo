import React, {useState, useEffect} from "react";
import {ethers} from "ethers";

import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/core/styles";

import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import SwapVertIcon from "@material-ui/icons/SwapVert";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import {useSnackbar} from "notistack";
import {DialogContent, Hidden} from "@material-ui/core";
import Fab from "@material-ui/core/Fab";
import {accountVar, providerVar, daiVar} from "../cache";
import {useQueryWithAccount} from "../hooks";
import {useReactiveVar, gql, useQuery, useMutation} from "@apollo/client";
import UserBalance from "./UserBalance";

const INIT_BALACES = gql`
  query getBalances($id: ID!) {
    user(id: $id) {
      id
      contract {
        id
      }
    }
  }
`;

const MINT_TOKENS = gql`
  mutation mintTokens($id: ID!) {
    mintTokens(id: $id)
  }
`;

const WITHDRAW_BALANCE = gql`
  mutation withdraw($id: ID!) {
    withdraw(id: $id)
  }
`;

const SUBSCRIBE_BALANCE = gql`
  subscription subscribeBalance($id: ID!) {
    daiBalance(id: $id) {
      id
      balance
    }
  }
`;

const GET_BALANCE = gql`
  query getBalance($id: id) {
    getBalance(id: $id) {
      id
      balance
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    direction: "column",
    zIndex: 1,
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(3),
  },

  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    spacing: theme.spacing(3),
  },

  underline: {
    textDecoration: "underline",
  },
}));

export default function Balances() {
  let dai = useReactiveVar(daiVar);
  let provider = useReactiveVar(providerVar);
  let account = useReactiveVar(accountVar);
  let {loading, data} = useQueryWithAccount(INIT_BALACES);
  let [withdraw] = useMutation(WITHDRAW_BALANCE);

  let [mintTokens, {error}] = useMutation(MINT_TOKENS);

  if (error) {
    console.log(error.message);
  }

  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [ethbal, setEthBal] = useState(0);
  const [daibal, setDaiBal] = useState(0);
  const [contractbal, setContractbal] = useState(0);

  const {enqueueSnackbar} = useSnackbar();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function _mintTokens() {
    if (account) {
      enqueueSnackbar("Request Processing", {
        variant: "success",
      });

      mintTokens({variables: {id: account}}).catch((err) => {
        enqueueSnackbar(`${err.message}`, {
          variant: "warning",
        });
      });
    } else {
      enqueueSnackbar("No account", {
        variant: "error",
      });
    }
  }

  function _withdraw() {
    // this isnt working because I get rid of contractBal subs on front end. need to pass setstate to component
    if (contractbal === "0.0") {
      enqueueSnackbar("No funds to withdraw", {
        variant: "warning",
      });
      return;
    }
    enqueueSnackbar("Request Processing", {
      variant: "success",
    });

    withdraw({variables: {id: data.user.contract.id}}).then((data) => {
      console.log(data);
    });
  }

  const contractComp = (
    <>
      <Grid item>
        <Typography variant="subtitle1" className={classes.underline}>
          Contract:
        </Typography>
      </Grid>
      <Grid item>
        {data?.user?.contract?.id ? (
          <UserBalance id={data.user.contract.id} balName="Contract" />
        ) : null}
      </Grid>
      <Grid item>
        <Button onClick={_withdraw} color="primary" variant="contained">
          <SwapVertIcon />
          Withdraw {"  "}
        </Button>
      </Grid>
    </>
  );

  const balancesCard = (
    <>
      <Grid container className={classes.container} spacing={1}>
        {data?.user?.contract ? contractComp : null}
        <Grid item>
          <Typography variant="subtitle1" className={classes.underline}>
            Personal:
          </Typography>
        </Grid>
        <Grid item>
          {data?.user?.id ? (
            <UserBalance id={data.user.id} balName="Personal" />
          ) : null}
        </Grid>
        <Grid item>
          <Button onClick={_mintTokens} color="primary" variant="contained">
            <AttachMoneyIcon />
            Get Dai {"  "}
          </Button>
        </Grid>
      </Grid>
    </>
  );

  return (
    <>
      <Hidden mdUp>
        <Fab
          className={classes.root}
          color="secondary"
          variant="extended"
          onClick={handleOpen}
        >
          <AttachMoneyIcon />
          Balances
        </Fab>
      </Hidden>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Balances:</DialogTitle>
        <DialogContent dividers>{balancesCard}</DialogContent>
      </Dialog>
      <Hidden smDown>
        <Card className={classes.root} raised>
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              Balances:
            </Typography>
            {balancesCard}
          </CardContent>
        </Card>
      </Hidden>
    </>
  );
}
