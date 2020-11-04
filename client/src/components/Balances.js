import React, {useState, useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {ethers} from "ethers";
import axios from "axios";

import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/core/styles";

import * as actions from "../store/actions/web3Actions";
import store from "../store/myStore";
import EthIcon from "../img/ethereum.svg";
import Icon from "@material-ui/core/Icon";
import PaymentIcon from "@material-ui/icons/Payment";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";

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
    flexDirection: "column",
    alignItems: "center",
    spacing: theme.spacing(3),
  },
}));

export default function Balances() {
  const classes = useStyles();
  const web3State = useSelector((state) => state.Web3Reducer);
  const [ethbal, setEthBal] = useState(0);
  const [daibal, setDaiBal] = useState(0);
  const dispatch = useDispatch();

  const {enqueueSnackbar, closeSnackbar} = useSnackbar();

  useEffect(() => {
    setTimeout(getBlances, 1000);
    // eslint-disable-next-line
  }, []);

  async function getBlances() {
    const _web3State = store.getState().Web3Reducer;

    if (_web3State.provider) {
      const ethbal = await _web3State.provider.getBalance(_web3State.account);
      setEthBal(parseFloat(ethers.utils.formatEther(ethbal)).toFixed(3));

      if (_web3State.Dai) {
        const daibal = await _web3State.Dai.balanceOf(_web3State.account);
        setDaiBal(ethers.utils.formatEther(daibal));
      }
      setTimeout(getBlances, 1000);
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

  return (
    <Card className={classes.root} raised>
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          Balances:
        </Typography>
        <Grid container className={classes.container} spacing={1}>
          <Grid item>
            <Typography>{ethbal} Eth</Typography>
          </Grid>

          <Grid item>
            <Typography>{daibal} Dai</Typography>
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
