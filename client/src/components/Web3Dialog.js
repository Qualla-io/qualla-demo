import React, { useEffect } from "react";
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
  daiVar,
  ethVar,
  providerVar,
  signerVar,
  subscriptionVar,
} from "../cache";

import DaiContract from "../artifacts/contracts/TestDai.sol/TestDai.json";
import SubscriptionContract from "../artifacts/contracts/SubscriptionV1.sol/SubscriptionV1.json";

export default function Web3Dialog() {
  // let account = useReactiveVar(accountVar);
  // let signer = useReactiveVar(signerVar);
  // let subscriptionV1 = useReactiveVar(subscriptionVar);
  // let provider = useReactiveVar(providerVar);
  // let dai = useReactiveVar(daiVar);
  let eth = useReactiveVar(ethVar);

  useEffect(() => {
    async function _init() {
      initWeb3();
    }
    _init();
    // eslint-disable-next-line
  }, []);

  async function initWeb3() {
    try {
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
        cacheProvider: false,
        providerOptions,
      });

      const eth = await web3Modal.connect();
      ethVar(eth);

      eth.on("accountsChanged", (accounts) => {
        ethVar(null);
        initWeb3();
      });

      eth.on("chainChanged", (accounts) => {
        ethVar(null);
        initWeb3();
      });

      eth.on("disconnect", (error) => {
        ethVar(null);
        console.log("disconnected");
        ethVar(null);
      });

      // let web3 = await getWeb3();
      // updateWeb3("eth", eth);

      const provider = new ethers.providers.Web3Provider(eth);
      // const provider = new ethers.providers.JsonRpcProvider(
      //   "http://127.0.0.1:8545",
      //   // {chaindId: 5777, name: "local"}
      // );

      providerVar(provider);

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
      var subscriptionV1 = new ethers.Contract(
        process.env.REACT_APP_GRAPHQL_SUB_CONTRACT,
        SubscriptionContract.abi,
        signer
      );

      subscriptionV1 = subscriptionV1.connect(signer);
      subscriptionVar(subscriptionV1);
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  }

  return (
    <Dialog open={!eth}>
      <DialogTitle id="form-dialog-title">Welcome to Qualla!</DialogTitle>
      <DialogContent dividers>
        <Typography>
          This demo requires connection to an Ethereum enabled wallet to sign
          transactions. We reccomend the browser extension MetaMask for the best
          user experience. To download MetaMask please choose the option below.
          If you have an Ethereum wallet already, please click "Connect" below.
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
        <Button onClick={initWeb3}>Connect Wallet</Button>
      </DialogActions>
    </Dialog>
  );
}
