import React, { useState } from "react";
import { ethers } from "ethers";
import { useSnackbar } from "notistack";

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Avatar,
  Typography,
  Button,
  makeStyles,
} from "@material-ui/core";
import AvatarIcons from "../../../components/AvatarIcons";
import { useMutation, useReactiveVar } from "@apollo/client";
import { PERMIT, SUBSCRIBE } from "../queries";
import { accountVar, daiVar, signerVar, subscriptionVar } from "../../../cache";
import ConfirmationModal from "../../../components/ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  edit: {
    marginLeft: "auto",
  },
  item: {
    display: "inline-flex",
    alignItems: "center",
  },
  itemCenter: {
    display: "flex",
    flexDirection: "Column",
    alignItems: "center",
    justifyContent: "center",
  },
  itemDescription: {
    display: "flex",
    flexDirection: "Column",
    // alignItems: "center",
  },
  itemContainer: {
    marginTop: theme.spacing(1),
  },
  title: {
    marginBottom: -theme.spacing(3),
  },
  numbers: {
    paddingLeft: theme.spacing(3),
  },
  titleField: {
    flexGrow: 1,
  },
  about: {
    marginTop: theme.spacing(2),
  },
  description: {
    width: "100%",
    // border: "1px solid grey",
    borderRadius: 5,
    padding: theme.spacing(1),
  },
  buy: {
    width: "75%",
    backgroundColor: theme.palette.tertiary.main,
  },
  avatar: {
    height: 100,
    width: 100,
    backgroundColor: theme.palette.secondary.main,
  },
  icons: {
    fontSize: "3em",
  },
  avatarItem: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
}));

export default function BaseTokenCard({ tokenProps, accountProps }) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  let account = useReactiveVar(accountVar);
  let dai = useReactiveVar(daiVar);
  let signer = useReactiveVar(signerVar);
  let subscriptionV1 = useReactiveVar(subscriptionVar);
  const [subscribe] = useMutation(SUBSCRIBE);
  const [permit] = useMutation(PERMIT);

  let [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    description: "",
    onSubmit: null,
    onClose: null,
  });

  function closeModal() {
    setConfirmModal({
      open: false,
      title: "",
      description: "",
      onClose: null,
      onSubmit: null,
    });
  }

  function permitDialog() {
    setConfirmModal({
      open: true,
      onClose: closeModal,
      onSubmit: _permit,
      title: "Permit Funds Transfer?",
      description:
        "You will next be asked to sign a message to confirm allowing the subscription smart contract to move funds on your behalf. Please sign to continue.",
    });
  }

  function subscribeDialog() {
    setConfirmModal({
      open: true,
      onClose: closeModal,
      onSubmit: _subscribe,
      title: "Subscribe?",
      description: `Please confirm your subscription purchase by clicking "Confirm" below. You will then be asked to sign the transaction and your account will be charged immediately.`,
    });
  }

  async function _subscribe() {
    closeModal();
    let subscriberData = {
      user: account,
      nonce: accountProps?.nonce,
      action: "subscribe",
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

    let signature = await signer._signTypedData(
      domain,
      creatorTypes,
      subscriberData
    );

    subscribe({
      variables: { userID: account, baseTokenID: tokenProps?.id, signature },
      update(cache) {
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

  async function _permit() {
    closeModal();
    // move this to graph at some point
    let nonce = await dai.nonces(account);

    nonce = nonce.toString();

    var message = {
      holder: account,
      spender: subscriptionV1.address,
      nonce,
      expiry: parseInt(0),
      allowed: true,
    };

    let domain = {
      name: "Dai Stablecoin",
      version: "1",
      chainId: 31337,
      verifyingContract: dai.address.toLowerCase(),
    };

    let permitTypes = {
      Permit: [
        {
          name: "holder",
          type: "address",
        },
        {
          name: "spender",
          type: "address",
        },
        {
          name: "nonce",
          type: "uint256",
        },
        {
          name: "expiry",
          type: "uint256",
        },
        {
          name: "allowed",
          type: "bool",
        },
      ],
    };

    let signature = await signer._signTypedData(domain, permitTypes, message);

    permit({
      variables: { userID: account, signature, nonce },
    }).then(subscribeDialog());
  }

  function handleSubscribe() {
    console.log(accountProps);
    if (accountProps?.approved) {
      subscribeDialog();
    } else {
      console.log(accountProps);
      permitDialog();
    }
  }

  return (
    <>
      <Card style={{ height: "100%" }}>
        <CardHeader title={tokenProps.title} className={classes.title} />
        <CardContent>
          <Grid container spacing={2} style={{ flexGrow: 1 }}>
            <Grid item xs={12} className={classes.item}>
              <div className={classes.avatarItem}>
                <Avatar className={classes.avatar}>
                  <AvatarIcons
                    customProps={classes.icons}
                    i={tokenProps.avatarID}
                  />
                </Avatar>
              </div>
            </Grid>
            <Grid item xs={12} className={classes.itemCenter}>
              <Typography variant="h5" style={{ textAlign: "center" }}>
                <b>${ethers.utils.formatEther(tokenProps.paymentValue)}</b>
              </Typography>
              <Typography variant="subtitle1" style={{ textAlign: "center" }}>
                Dai/Month
              </Typography>
            </Grid>
            <Grid item xs={12} className={classes.itemCenter}>
              <Button
                variant="contained"
                className={classes.buy}
                onClick={handleSubscribe}
              >
                Purchase
              </Button>
            </Grid>
            <Grid item xs={12} className={classes.itemDescription}>
              <Typography className={classes.about} variant="subtitle2">
                About this tier:
              </Typography>
              <Typography className={classes.description} variant="h6">
                {tokenProps.description}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <ConfirmationModal props={confirmModal} />
    </>
  );
}
