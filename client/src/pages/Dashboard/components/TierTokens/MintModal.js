import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { useMutation, useReactiveVar } from "@apollo/client";
import BigNumber from "bignumber.js";

import { accountVar, signerVar, subscriptionVar } from "../../../../cache";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import { useQueryWithAccountNetwork } from "../../../../hooks";
import NewTokenCard from "./NewTokenCard";
import { GET_USER_NONCE, MINT_BATCH, MINT_ONE } from "./queries";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  makeStyles,
  Typography,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  mintBtn: {
    backgroundColor: theme.palette.tertiary.main,
  },
  grd: {
    display: "flex-inline",
  },
  dialog: {
    flexGrow: 1,
  },
  title: {
    display: "flex",
  },
  subtitle: {
    position: "absolute",
    right: theme.spacing(3),
    top: theme.spacing(3),
  },
}));

export default function MintModal({ open, setOpen }) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  let account = useReactiveVar(accountVar);
  let signer = useReactiveVar(signerVar);
  let subscriptionV1 = useReactiveVar(subscriptionVar);
  let { data } = useQueryWithAccountNetwork(GET_USER_NONCE);
  const [tokens, setTokens] = useState([
    { title: "", value: "0", description: "", quantity: "0", avatar: 0 },
  ]);
  let [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    description: "",
    onSubmit: null,
    onClose: null,
  });
  let [i, setI] = useState(0);

  const [mintOne] = useMutation(MINT_ONE);
  const [mintBatch] = useMutation(MINT_BATCH);

  function handleClose() {
    setOpen(false);
  }

  useEffect(() => {
    console.log(i);
  }, [i]);

  function addToken() {
    setTokens([
      ...tokens,
      { title: "", value: "0", description: "", quantity: "0", avatar: 0 },
    ]);
  }

  function onTokenChange(key, name, value) {
    let temp = [...tokens];
    let _token = temp[key];
    _token[name] = value;
    temp[key] = _token;
    setTokens(temp);
  }

  function subToken(key) {
    let _tokens = [...tokens];
    _tokens.splice(key, 1);
    if (_tokens.length === 0) {
      setTokens([
        { title: "", value: "0", description: "", quantity: "0", avatar: 0 },
      ]);
      setI(0);
    } else {
      setTokens(_tokens);
      if (i !== 0) {
        setI(i - 1);
      }
    }
  }

  function closeConfirm() {
    setConfirmModal({
      open: false,
      title: "",
      description: "",
      onClose: null,
      onSubmit: null,
    });
  }

  function mintDialog() {
    for (var i = 0; i < tokens.length; i++) {
      // Form Checking

      if (tokens[i].title === "" || tokens[i].description === "") {
        enqueueSnackbar(
          `Please fill out all fields for token #${i + 1} before minting`,
          {
            variant: "warning",
          }
        );
        return;
      }

      if (new BigNumber(tokens[i].quantity).lt(0)) {
        enqueueSnackbar(`Please enter valid quantities for token #${i + 1}`, {
          variant: "warning",
        });
        return;
      }

      if (new BigNumber(tokens[i].value).lte(0) || tokens[i].value === "") {
        enqueueSnackbar(`Please enter valid values for token #${i + 1}`, {
          variant: "warning",
        });
        return;
      } else if (new BigNumber(tokens[i].value).gt(100)) {
        enqueueSnackbar(
          `Maximum value is $100 Dai for this demo. Update token #${i + 1}`,
          {
            variant: "warning",
          }
        );
        return;
      }
    }

    setConfirmModal({
      open: true,
      onClose: closeConfirm,
      onSubmit: _onMint,
      title: "Mint Tokens?",
      description: `Please sign the following message to mint your subscription tokens. Note: Token value and period cannot be changed after minting. Quantity can only be decreased by burning unsold tokens.`,
    });
  }

  async function _onMint() {
    closeConfirm();

    let userData = {
      user: account,
      nonce: data?.user?.nonce,
      action: "mint",
    };

    let domain = {
      name: "Qualla Subscription",
      version: "1",
      chainId: process.env.REACT_APP_CHAIN_ID,
      verifyingContract: subscriptionV1.address,
    };

    let creatorTypes = {
      User: [
        { name: "user", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "action", type: "string" },
      ],
    };

    let _quantity = [];
    let _value = [];
    let _title = [];
    let _description = [];
    let _avatar = [];

    for (var i = 0; i < tokens.length; i++) {
      _quantity.push(tokens[i].quantity);
      _value.push(tokens[i].value);
      _title.push(tokens[i].title);
      _description.push(tokens[i].description);
      _avatar.push(tokens[i].avatar.toString());
    }

    let signature = await signer._signTypedData(domain, creatorTypes, userData);

    if (tokens.length > 1) {
      mintBatch({
        variables: {
          userID: account,
          quantity: _quantity,
          paymentValue: _value,
          signature,
          title: _title,
          description: _description,
          avatarID: _avatar,
        },
        update(cache) {
          // update basetoken to cache
          //   cache.modify({
          //     id: cache.identify({
          //       id: account.toLowerCase(),
          //       __typename: "User",
          //     }),
          //     fields: {
          //       nonce(cachedNonce) {
          //         return cachedNonce + 1;
          //       },
          //     },
          //     broadcast: false,
          //   });
        },
      })
        .then((res) => {
          enqueueSnackbar(`Request proccessing, check back in a few minutes!`, {
            variant: "success",
          });
        })
        .catch((err) => {
          enqueueSnackbar(`${err}`, {
            variant: "error",
          });
        });
    } else {
      mintOne({
        variables: {
          userID: account,
          quantity: tokens[0].quantity,
          paymentValue: tokens[0].value,
          signature,
          title: tokens[0].title,
          description: tokens[0].description,
          avatarID: tokens[0].avatar.toString(),
        },
        update(cache) {
          // update basetoken to cache
          // cache.modify({
          //   id: cache.identify({
          //     id: account.toLowerCase(),
          //     __typename: "User",
          //   }),
          //   fields: {
          //     nonce(cachedNonce) {
          //       return cachedNonce + 1;
          //     },
          //   },
          //   broadcast: false,
          // });
        },
      })
        .then((res) => {
          enqueueSnackbar(`Request proccessing, check back in a few minutes!`, {
            variant: "success",
          });
        })
        .catch((err) => {
          enqueueSnackbar(`${err}`, {
            variant: "error",
          });
        });
    }

    setTokens([
      { title: "", value: "0", description: "", quantity: "0", avatar: 0 },
    ]);
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <div className={classes.title}>
            <Typography variant="h6">Mint Tier Tokens</Typography>

            <Typography className={classes.subtitle}>
              Token {i + 1} of {tokens.length}
            </Typography>
          </div>
        </DialogTitle>
        <DialogContent dividers className={classes.dialog}>
          <NewTokenCard
            token={tokens[i]}
            i={i}
            len={tokens.length}
            addToken={addToken}
            setI={setI}
            subToken={subToken}
            onTokenChange={onTokenChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            Cancel
          </Button>
          <Button
            onClick={mintDialog}
            variant="contained"
            className={classes.mintBtn}
          >
            Mint
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmationModal props={confirmModal} />
    </>
  );
}
