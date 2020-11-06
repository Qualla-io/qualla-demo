import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {ethers} from "ethers";
import axios from "axios";

import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/core/styles";

import store from "../store/myStore";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Divider from "@material-ui/core/Divider";

import {useSnackbar} from "notistack";

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
  const classes = useStyles();
  const web3State = useSelector((state) => state.Web3Reducer);
  const creatorState = useSelector((state) => state.CreatorReducer);
  const [ethbal, setEthBal] = useState(0);
  const [daibal, setDaiBal] = useState(0);
  const [contractbal, setContractbal] = useState(0);

  const {enqueueSnackbar} = useSnackbar();

  useEffect(() => {
    getBlances();
  }, [web3State.provider, creatorState.contract.address]);

  useEffect(() => {
    subscribePersonalDai();
  }, [web3State.Dai, web3State.account]);

  useEffect(() => {
    subscribeContractDai();
  }, [web3State.Dai, creatorState.contract.address]);

  async function subscribePersonalDai() {
    if (web3State.Dai && web3State.account) {
      let filterFromMe = web3State.Dai.filters.Transfer(
        web3State.account,
        null
      );

      let filterToMe = web3State.Dai.filters.Transfer(null, web3State.account);

      let handleTransfer = async function (from, to, amount) {
        web3State.Dai.balanceOf(web3State.account).then((daibal) => {
          setDaiBal(ethers.utils.formatEther(daibal));

          enqueueSnackbar("Personal Balance Updated", {
            variant: "success",
            autoHideDuration: 2000,
          });
        });
      };

      web3State.Dai.on(filterFromMe, handleTransfer);
      web3State.Dai.on(filterToMe, handleTransfer);
    }
  }

  async function subscribeContractDai() {
    if (web3State.Dai && creatorState.contract.address) {
      // web3State.Dai.removeAllListeners("Transfer");

      let filterFromMe = web3State.Dai.filters.Transfer(
        creatorState.contract.address,
        null
      );

      let filterToMe = web3State.Dai.filters.Transfer(
        null,
        creatorState.contract.address
      );

      let handleTransfer = async function (from, to, amount) {
        web3State.Dai.balanceOf(creatorState.contract.address).then(
          (contractbal) => {
            setContractbal(ethers.utils.formatEther(contractbal));

            enqueueSnackbar("Contract Balance Updated", {
              variant: "success",
              autoHideDuration: 2000,
            });
          }
        );
      };

      web3State.Dai.on(filterFromMe, handleTransfer);
      web3State.Dai.on(filterToMe, handleTransfer);
    }
  }

  async function getBlances() {
    // Change this to subscribe to events instead of pinging chain
    const _web3State = store.getState().Web3Reducer;
    const _creatorState = store.getState().CreatorReducer;

    if (_web3State.provider) {
      _web3State.provider.getBalance(_web3State.account).then((ethbal) => {
        setEthBal(parseFloat(ethers.utils.formatEther(ethbal)).toFixed(3));
      });

      if (_web3State.Dai) {
        _web3State.Dai.balanceOf(_web3State.account).then((daibal) => {
          setDaiBal(ethers.utils.formatEther(daibal));
        });
      }
      if (_creatorState.contract.address) {
        _web3State.Dai.balanceOf(_creatorState.contract.address).then(
          (contractbal) => {
            setContractbal(ethers.utils.formatEther(contractbal));
          }
        );
      }
    }
  }

  function mintTokens() {
    axios
      .post("http://localhost:8080/mint", {
        account: web3State.account,
        coin: web3State.Dai.address,
      })
      .then((res) => {
        enqueueSnackbar("Request Processing", {
          variant: "success",
          autoHideDuration: 2000,
        });
      })
      .catch((err) => {
        enqueueSnackbar(err.response.data.error, {
          variant: "warning",
          autoHideDuration: 2000,
        });
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
        <Typography>${contractbal} Dai</Typography>
      </Grid>
      <Grid item>
        <Divider />
      </Grid>
    </>
  );

  return (
    <Card className={classes.root} raised>
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          Balances:
        </Typography>
        <Grid container className={classes.container} spacing={1}>
          <Divider />
          {creatorState.contract.address ? contractComp : null}
          <Grid item>
            <Typography variant="subtitle1" className={classes.underline}>
              Personal:
            </Typography>
          </Grid>
          <Grid item>
            <Typography>{ethbal} Eth</Typography>
          </Grid>

          <Grid item>
            <Typography>${daibal} Dai</Typography>
          </Grid>
          <Grid item>
            <Button onClick={mintTokens} color="primary" variant="contained">
              Get Dai {"  "}
              <AttachMoneyIcon />
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
