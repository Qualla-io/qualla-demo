import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ethers } from "ethers";

import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import store from "../store/myStore";
import EthIcon from "../img/ethereum.svg";
import Icon from "@material-ui/core/Icon";
import PaymentIcon from "@material-ui/icons/Payment";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    direction: "row",
  },
}));

export default function Balances() {
  const classes = useStyles();
  const web3State = useSelector((state) => state.Web3Reducer);
  const [ethbal, setEthBal] = useState(0);
  const [daibal, setDaiBal] = useState(0);

  useEffect(() => {
    setTimeout(getBlances, 1000);
    // eslint-disable-next-line
  }, []);

  async function getBlances() {
    const _web3State = store.getState().Web3Reducer;

    if (_web3State) {
      const ethbal = await _web3State.provider.getBalance(_web3State.account);
      setEthBal(ethers.utils.formatEther(ethbal));

      if (_web3State.Dai) {
        const daibal = await _web3State.Dai.balanceOf(_web3State.account);
        setDaiBal(ethers.utils.formatEther(daibal));
      }
      setTimeout(getBlances, 1000);
    }
  }

  async function mintTokens() {
    const Dai = web3State.Dai;

    await Dai.mintTokens(web3State.account);
  }

  return (
    <div className={classes.root}>
      <Icon>
        <img src={EthIcon} height={25} width={25} alt="" />
      </Icon>
      <Typography>{ethbal}</Typography>

      <AttachMoneyIcon />
      <Typography>{daibal}</Typography>

      <Button onClick={mintTokens} color="primary" variant="contained">
        <PaymentIcon />
      </Button>
    </div>
  );
}
