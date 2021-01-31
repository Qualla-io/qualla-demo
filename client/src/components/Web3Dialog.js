import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import { useReactiveVar } from "@apollo/client";
import {
  accountVar,
  chainIdVar,
  daiVar,
  ethVar,
  providerVar,
  signerVar,
  // subscriptionVar,
} from "../cache";
import ChainModal from "./ChainModal";
import DaiContract from "../artifacts/contracts/TestDai.sol/TestDai.json";
// import Qualla from "../artifacts/contracts/Qualla.sol/Qualla.json";

const providerOptions = {
  // fortmatic: {
  //   package: Fortmatic, // required
  //   options: {
  //     key: "FORTMATIC_KEY", // required
  //   },
  // },
  // walletconnect: {
  //   package: WalletConnectProvider, // required
  //   options: {
  //     infuraId: "INFURA_ID", // required
  //   },
  // },
};

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions,
});

export async function initWeb3() {
  try {
    const eth = await web3Modal.connect();
    ethVar(eth);

    eth.on("accountsChanged", async (accounts) => {
      console.log("accounts changed");
      await web3Modal.clearCachedProvider();
      ethVar(null);
      accountVar(null);
      // initWeb3();
    });

    eth.on("chainChanged", (chainID) => {
      console.log("chain changed");
      // ethVar(null);
      initWeb3();
    });

    eth.on("disconnect", async (error) => {
      ethVar(null);
      console.log("disconnected");
      await web3Modal.clearCachedProvider();
    });

    // let web3 = await getWeb3();
    // updateWeb3("eth", eth);

    const provider = new ethers.providers.Web3Provider(eth);
    // const provider = new ethers.providers.JsonRpcProvider(
    //   "http://127.0.0.1:8545",
    //   // {chaindId: 5777, name: "local"}
    // );

    providerVar(provider);
    let _chainID = await (await provider.getNetwork()).chainId;
    chainIdVar(_chainID.toString());
    //change this for deployment
    // if (_chainID.toString() !== process.env.REACT_APP_CHAIN_ID) {
    //   setOpen(true);
    // }

    const signer = provider.getSigner();
    signerVar(signer);

    var Dai = new ethers.Contract(
      process.env.REACT_APP_GRAPHQL_DAI_CONTRACT,
      DaiContract.abi,
      provider
    );

    Dai = Dai.connect(signer);
    daiVar(Dai);

    const account = await signer.getAddress();

    accountVar(account);

    // var subscriptionV1 = new ethers.Contract(
    //   process.env.REACT_APP_GRAPHQL_SUB_CONTRACT,
    //   Qualla.abi,
    //   signer
    // );

    // subscriptionV1 = subscriptionV1.connect(signer);
    // subscriptionVar(subscriptionV1);
  } catch (error) {
    console.error(error);
  }
}

export default function Web3Dialog({ _open }) {
  let eth = useReactiveVar(ethVar);
  let chainId = useReactiveVar(chainIdVar);
  const [open, setOpen] = useState(_open);

  async function _init() {
    if (web3Modal.cachedProvider) {
      initWeb3();
    }
  }

  const handleClose = () => {
    localStorage.setItem("read", true);
    setOpen(false);
  };

  useEffect(() => {
    _init();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Dialog open={open}>
        <DialogTitle id="form-dialog-title">Welcome to Qualla!</DialogTitle>
        <DialogContent dividers>
          <Typography>
            This demo requires connection to an Ethereum enabled wallet to
            interact with and sign transactions. We recommend using Chrome or
            Brave browser using the extension MetaMask for the best user
            experience. To download MetaMask please choose the option below. If
            you have an Ethereum wallet already, please click "Connect Wallet"
            on the dashboard. No funds are needed to use the demo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            href="https://metamask.io/download.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download MetaMask
          </Button>
          <Button onClick={handleClose}>Continue</Button>
        </DialogActions>
      </Dialog>
      <ChainModal open={eth && chainId !== process.env.REACT_APP_CHAIN_ID} />
    </>
  );
}
