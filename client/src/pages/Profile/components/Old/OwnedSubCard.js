import React, { useState } from "react";
import { useSnackbar } from "notistack";
import { ethers } from "ethers";
// import { useRouteMatch } from "react-router-dom";

import { useReactiveVar, useMutation } from "@apollo/client";

import { Avatar, Button, Typography } from "@material-ui/core";

import { UNSUBSCRIBE, GET_USER_NONCE } from "../../queries";
import { accountVar, subscriptionVar, signerVar } from "../../../../cache";
import { useQueryWithAccount } from "../../../../hooks";
import AvatarIcons from "../../../../components/AvatarIcons";
import { cardStyles } from "./styles";
import ConfirmationModal from "../../../../components/ConfirmationModal";

export default function OwnedSubCard(props) {
  const { enqueueSnackbar } = useSnackbar();
  const classes = cardStyles();
  let account = useReactiveVar(accountVar);
  let signer = useReactiveVar(signerVar);
  let subscriptionV1 = useReactiveVar(subscriptionVar);
  // const { url } = useRouteMatch();

  let { data } = useQueryWithAccount(GET_USER_NONCE);
  let [unsubscribe] = useMutation(UNSUBSCRIBE);
  let [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    description: "",
    onSubmit: null,
    onClose: null,
  });
  let token = props.token;

  function closeModal() {
    setConfirmModal({
      open: false,
      title: "",
      description: "",
      onClose: null,
      onSubmit: null,
    });
  }

  function unsubscribeDialog() {
    setConfirmModal({
      open: true,
      onClose: closeModal,
      onSubmit: _unSub,
      title: "Unsubscribe?",
      description: `Are you sure you want to unsubscribe? You will lose all subscription perks as soon as the transaction processes.`,
    });
  }

  async function _unSub() {
    closeModal();
    let subscriberData = {
      user: account,
      nonce: data?.user?.nonce,
      action: "unsubscribe",
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

    unsubscribe({
      variables: { userID: account, tokenID: token?.id, signature },
      update(cache) {
        // update nonce and delete subtoken from cache

        cache.modify({
          id: cache.identify({
            id: account.toLowerCase(),
            __typename: "User",
          }),
          fields: {
            nonce(cachedNonce) {
              return cachedNonce + 1;
            },
            // Modify query
            subscriptions(exsistingSubscriptionRefs, { readField }) {
              return exsistingSubscriptionRefs.filter(
                (subscriptionRef) =>
                  token.id !== readField("id", subscriptionRef)
              );
            },
          },
          broadcast: false,
        });
      },
    })
      .then((res) => {
        enqueueSnackbar(`Unsubscribe successful`, {
          variant: "success",
        });
      })
      .catch((err) => {
        enqueueSnackbar(`${err}`, {
          variant: "error",
        });
      });
  }

  return (
    <div className={classes.card}>
      <Avatar className={classes.avatar}>
        <AvatarIcons
          customProps={classes.icons}
          i={token?.baseToken?.avatarID}
        />
      </Avatar>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          {token?.baseToken?.title}
        </Typography>
      </div>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          <b>
            $
            {ethers.utils
              .formatEther(token?.baseToken?.paymentValue)
              .toString()}
          </b>
        </Typography>
        <Typography display="inline">{` `}Dai/mo.</Typography>
      </div>
      <Button
        variant="contained"
        color="secondary"
        className={classes.content}
        onClick={unsubscribeDialog}
      >
        Unsubscribe
      </Button>
      <ConfirmationModal props={confirmModal} />
    </div>
  );
}
