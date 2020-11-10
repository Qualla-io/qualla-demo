import React, {useEffect} from "react";
// import { useSelector, useDispatch } from "react-redux";
import {useDispatch} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";
import BaseRouter from "./routes";
import * as web3Actions from "./store/actions/web3Actions";
import * as creatorActions from "./store/actions/CreatorActions";
import store from "./store/myStore";

import DaiContract from "./contracts/TestDai.json";
import SubscriptionFactory from "./contracts/SubscriptionFactory.json";
import SubscriptionContract from "./contracts/SubscriptionV1.json";

import axios from "axios";
import {ethers} from "ethers";
import {SnackbarProvider} from "notistack";
import {ApolloClient, InMemoryCache, gql, ApolloProvider} from "@apollo/client";

import Web3Modal from "web3modal";
// import Fortmatic from "fortmatic";
// import WalletConnectProvider from "@walletconnect/web3-provider";
import "./App.css";
import {createMuiTheme, ThemeProvider} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Layout from "./containers/Layout";

if (!process.env.REACT_APP_GRAPHQL_ENDPOINT) {
  throw new Error(
    "REACT_APP_GRAPHQL_ENDPOINT environment variable not defined"
  );
}

// const client = new ApolloClient({
//   uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
//   cache: new InMemoryCache(),
// });

const font = "'Rubik', sans-serif";

const theme = createMuiTheme({
  typography: {
    fontFamily: font,
    button: {
      // textTransform: "none",
    },
  },
});

export default function App() {
  // const web3State = useSelector((state) => state.Web3Reducer);
  const dispatch = useDispatch();

  function updateWeb3(key, value) {
    dispatch(web3Actions.updateWeb3(key, value));
  }

  function updateCreator(key, value) {
    dispatch(creatorActions.updateCreator(key, value));
  }

  useEffect(() => {
    initWeb3();
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

      // let web3 = await getWeb3();
      updateWeb3("eth", eth);

      const provider = new ethers.providers.Web3Provider(eth);
      // const provider = new ethers.providers.JsonRpcProvider(
      //   "http://127.0.0.1:8545",
      //   {chaindId: 5777, name: "local"}
      // );

      // var provider = await getWeb3();
      updateWeb3("provider", provider);

      const signer = provider.getSigner();
      updateWeb3("signer", signer);

      var deployedNetwork = DaiContract.networks[5777];
      var Dai = new ethers.Contract(
        deployedNetwork && deployedNetwork.address,
        DaiContract.abi,
        provider
      );

      Dai = Dai.connect(signer);
      updateWeb3("Dai", Dai);

      deployedNetwork = SubscriptionFactory.networks[5777];
      var Factory = new ethers.Contract(
        deployedNetwork && deployedNetwork.address,
        DaiContract.abi,
        provider
      );

      Factory = Factory.connect(signer);
      updateWeb3("Factory", Factory);

      // // Use web3 to get the user's accounts.
      const account = await signer.getAddress();
      updateWeb3("account", account);

      const networkId = await provider.getNetwork();
      updateWeb3("chainId", networkId.chainId);

      // see it user has deployed contract
      axios
        .get(`http://localhost:8080/publishers/${account}/contract/`, {
          params: {publisher_address: account},
        })
        .then((res) => {
          if (res.data) {
            updateCreator("contract", res.data);

            var Subscription = new ethers.Contract(
              res.data.address,
              SubscriptionContract.abi,
              signer
            );

            updateCreator("contractInstance", Subscription);
          }
        });

      setTimeout(moniterWeb3, 1000);
      // moniterWeb3();
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  }

  async function moniterWeb3() {
    const _web3State = store.getState().Web3Reducer;
    if (_web3State.provider !== null) {
      const _signer = _web3State.provider.getSigner();
      const _account = await _signer.getAddress();

      if (_account !== _web3State.account) {
        window.location.reload();
      }
      setTimeout(moniterWeb3, 500);
    }
  }

  return (
    <div className="App">
      
        <Router>
          <ThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
              <CssBaseline />
              <Layout>
                <BaseRouter />
              </Layout>
            </SnackbarProvider>
          </ThemeProvider>
        </Router>
    </div>
  );
}
