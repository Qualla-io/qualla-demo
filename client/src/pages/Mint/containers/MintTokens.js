import React, { useState } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import { useSnackbar } from "notistack";

import { makeStyles } from "@material-ui/core/styles";
import { Button, GridListTile, Typography } from "@material-ui/core";

import CustomGridlist from "../../../containers/CustomGridlist";
import AddTokenCard from "../components/AddTokenCard";
import NewTokenCard from "../components/NewTokenCard";

import { GET_USER_NONCE, MINT_ONE, MINT_BATCH } from "../queries";
import { accountVar, signerVar, subscriptionVar } from "../../../cache";
import { useQueryWithAccount } from "../../../hooks";
import BigNumber from "bignumber.js";
import ConfirmationModal from "../../../components/ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  title: {
    marginTop: theme.spacing(6),
  },
  cardsDiv: {
    marginTop: theme.spacing(2),
    marginRight: -140,
    marginLeft: -140,
    paddingTop: theme.spacing(1),
    justifyContent: "space-around",
    overflow: "hidden",
    flexGrow: 1,
  },
}));

export default function MintTokens() {
  const { enqueueSnackbar } = useSnackbar();
  let account = useReactiveVar(accountVar);
  let signer = useReactiveVar(signerVar);
  let subscriptionV1 = useReactiveVar(subscriptionVar);
  let { data } = useQueryWithAccount(GET_USER_NONCE);
  const [tokens, setTokens] = useState([]);
  const classes = useStyles();
  const [mintOne] = useMutation(MINT_ONE);
  const [mintBatch] = useMutation(MINT_BATCH);
  let [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    description: "",
    onSubmit: null,
    onClose: null,
  });

  function addToken() {
    setTokens([
      ...tokens,
      { title: "", value: "0", description: "", quantity: "0", avatar: 0 },
    ]);
  }

  function subToken(key) {
    let _tokens = [...tokens];
    _tokens.splice(key, 1);
    setTokens(_tokens);
  }

  function onTokenChange(key, name, value) {
    let temp = [...tokens];
    let _token = temp[key];
    _token[name] = value;
    temp[key] = _token;
    setTokens(temp);
  }

  function closeModal() {
    setConfirmModal({
      open: false,
      title: "",
      description: "",
      onClose: null,
      onSubmit: null,
    });
  }

  function mintDialog() {
    setConfirmModal({
      open: true,
      onClose: closeModal,
      onSubmit: _onMint,
      title: "Mint Tokens?",
      description: `Please sign the following message to mint your subscription tokens. Note: Token value and period cannot be changed after minting. Quantity can only be decreased by burning unsold tokens.`,
    });
  }

  async function _onMint() {
    closeModal();
    let userData = {
      user: account,
      nonce: data?.user?.nonce,
      action: "mint",
    };

    let domain = {
      name: "Qualla Subscription",
      version: "1",
      chainId: 31337,
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
      // Form Checking

      if (tokens[i].title === "" || tokens[i].description === "") {
        enqueueSnackbar(`Please fill out all fields before minting`, {
          variant: "warning",
        });
        return;
      }

      if (new BigNumber(tokens[i].quantity).lt(0)) {
        enqueueSnackbar(`Please enter valid quantities for all tokens`, {
          variant: "warning",
        });
        return;
      }

      if (new BigNumber(tokens[i].value).lte(0) || tokens[i].value === "") {
        enqueueSnackbar(`Please enter valid values for all tokens`, {
          variant: "warning",
        });
        return;
      } else if (new BigNumber(tokens[i].value).gt(100)) {
        enqueueSnackbar(`Maximum value is $100 Dai for this demo`, {
          variant: "warning",
        });
        return;
      }

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
          cache.modify({
            id: cache.identify({
              id: account.toLowerCase(),
              __typename: "User",
            }),
            fields: {
              nonce(cachedNonce) {
                return cachedNonce + 1;
              },
            },
            broadcast: false,
          });
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
          cache.modify({
            id: cache.identify({
              id: account.toLowerCase(),
              __typename: "User",
            }),
            fields: {
              nonce(cachedNonce) {
                return cachedNonce + 1;
              },
            },
            broadcast: false,
          });
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

    setTokens([]);
  }

  return (
    <div>
      <Typography variant="h5" className={classes.title}>
        Mint Subscriptions:
      </Typography>
      <div className={classes.cardsDiv}>
        <CustomGridlist name="MintingTokens">
          {tokens.map((token, i) => (
            <GridListTile key={i}>
              <NewTokenCard
                token={token}
                i={i}
                customOnClick={subToken}
                onTokenChange={onTokenChange}
              />
            </GridListTile>
          ))}
          <GridListTile>
            <AddTokenCard customOnClick={addToken} />
          </GridListTile>
        </CustomGridlist>
      </div>
      <div style={{ display: "flex" }}>
        {/* To justify button right: */}
        {/* <div style={{ margin: "auto" }} /> */}
        {tokens.length > 0 ? (
          <Button variant="contained" color="secondary" onClick={mintDialog}>
            Mint
          </Button>
        ) : null}
      </div>
      <ConfirmationModal props={confirmModal} />
    </div>
  );
}
