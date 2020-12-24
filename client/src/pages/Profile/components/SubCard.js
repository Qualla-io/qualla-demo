import React, { useState } from "react";
import { useSnackbar } from "notistack";
import { useReactiveVar, useMutation } from "@apollo/client";
import { ethers } from "ethers";

import { cardStyles } from "./styles";
import { Avatar, Button, Typography } from "@material-ui/core";

import { PERMIT, SUBSCRIBE, GET_USER_NONCE } from "../queries";
import { daiVar, accountVar, subscriptionVar, signerVar } from "../../../cache";
import { useQueryWithAccount } from "../../../hooks";
import AvatarIcons from "../../../components/AvatarIcons";
import ConfirmationModal from "../../../components/ConfirmationModal";

export default function SubCard(props) {
  const { enqueueSnackbar } = useSnackbar();
  let account = useReactiveVar(accountVar);
  let dai = useReactiveVar(daiVar);
  let signer = useReactiveVar(signerVar);
  let subscriptionV1 = useReactiveVar(subscriptionVar);
  let [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    description: "",
    onSubmit: null,
    onClose: null,
  });

  let { data } = useQueryWithAccount(GET_USER_NONCE);

  const classes = cardStyles();
  let token = props.token;
  let [permit] = useMutation(PERMIT);
  let [subscribe] = useMutation(SUBSCRIBE);

  async function _subscribe() {
    closeModal();
    let subscriberData = {
      user: account,
      nonce: data?.user?.nonce,
      action: "subscribe",
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

    let signature = await signer._signTypedData(
      domain,
      creatorTypes,
      subscriberData
    );

    subscribe({
      variables: { userID: account, baseTokenID: token?.id, signature },
      update(cache, { data: subscribe }) {
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
      description: `Please confirm your subscription purchase by clicking "Confirm" below. You will then be asked ot sign the transaction and your account will be charged immediately.`,
    });
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

    let verAdd = ethers.utils.verifyTypedData(
      domain,
      permitTypes,
      message,
      signature
    );

    permit({
      variables: { userID: account, signature, nonce },
    }).then(subscribeDialog());
  }

  async function handleSub() {
    let allowance = await dai.allowance(account, subscriptionV1.address);

    if (!allowance.gt(0)) {
      await permitDialog();
    } else {
      await subscribeDialog();
    }
  }

  return (
    <div className={classes.card}>
      <Avatar className={classes.avatar}>
        <AvatarIcons customProps={classes.icons} i={token.avatarID} />
      </Avatar>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          {token.title}
        </Typography>
      </div>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          <b>
            $
            {ethers.utils
              .formatEther(token?.paymentValue?.toString())
              .toString()}
          </b>
        </Typography>
        <Typography display="inline">{` `}Dai/mo.</Typography>
      </div>
      <Button
        variant="contained"
        color="secondary"
        className={classes.content}
        onClick={handleSub}
      >
        Subscribe
      </Button>
      <ConfirmationModal props={confirmModal} />
    </div>
  );
}
