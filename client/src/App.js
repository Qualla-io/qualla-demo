import React from "react";

import { BrowserRouter as Router } from "react-router-dom";
import BaseRouter from "./routes";
import { SnackbarProvider } from "notistack";

import "./App.css";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Layout from "./containers/Layout";
import { IconButton } from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";

const font = "'Rubik', sans-serif";

const theme = createMuiTheme({
  palette: {
    background: {
      default: "#e0dede",
    },
    secondary: {
      main: "#be79df",
    },
    tertiary: {
      main: "#18E3BE",
    },
    text: {
      secondary: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: font,
    button: {
      // textTransform: "none",
    },
  },
});

const notistackRef = React.createRef();
const onClickDismiss = (key) => () => {
  notistackRef.current.closeSnackbar(key);
};

export default function App() {
  // useEffect(async () => {
  //   if (account && signer) {
  //     if (account !== (await signer.getAddress())) {
  //       window.location.reload();
  //     }
  //   }
  // }, [account, signer]);

  // TODO: redo monotoring
  // async function moniterWeb3() {
  //   const _web3State = store.getState().Web3Reducer;
  //   if (_web3State.provider !== null) {
  //     const _signer = _web3State.provider.getSigner();
  //     const _account = await _signer.getAddress();

  //     if (_account !== _web3State.account) {
  //       window.location.reload();
  //     }
  //     setTimeout(moniterWeb3, 500);
  //   }
  // }
  return (
    <div className="App">
      <Router>
        <ThemeProvider theme={theme}>
          <SnackbarProvider
            ref={notistackRef}
            maxSnack={3}
            autoHideDuration={4000}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            action={(key) => (
              <IconButton
                onClick={onClickDismiss(key)}
                style={{ color: "#fff" }}
              >
                <ClearIcon />
              </IconButton>
            )}
          >
            <CssBaseline />
            {/* <Tour /> */}
            <Layout>
              <BaseRouter />
            </Layout>
          </SnackbarProvider>
        </ThemeProvider>
      </Router>
    </div>
  );
}
