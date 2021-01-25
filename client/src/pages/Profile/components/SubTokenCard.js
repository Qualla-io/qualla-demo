import React, { useState } from "react";
import { ethers } from "ethers";
import { useSnackbar } from "notistack";
import BigNumber from "bignumber.js";

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
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";

import AvatarIcons from "../../../components/AvatarIcons";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { UNSUBSCRIBE } from "../queries";
import { accountVar, signerVar, subscriptionVar } from "../../../cache";
import { useMutation, useReactiveVar } from "@apollo/client";

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
  divTest: {
    display: "flex",
    justify: "bottom",
    alignItems: "bottom",
    whiteSpace: "pre-wrap",
  },
}));

export default function SubTokenCard({ tokenProps, accountProps }) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  let account = useReactiveVar(accountVar);
  let signer = useReactiveVar(signerVar);
  let subscriptionV1 = useReactiveVar(subscriptionVar);
  let [unsubscribe] = useMutation(UNSUBSCRIBE);
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

  function handleUnsubscribe() {
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
      nonce: accountProps?.nonce ? accountProps.nonce : 0,
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
      variables: { userID: account, tokenID: tokenProps?.id, signature },
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
                  tokenProps.id !== readField("id", subscriptionRef)
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
    <>
      <Card style={{ height: "100%" }}>
        <CardHeader
          title={tokenProps.baseToken.title}
          className={classes.title}
        />
        <CardContent>
          <Grid container spacing={2} style={{ flexGrow: 1 }}>
            <Grid item xs={12} className={classes.item}>
              <div className={classes.avatarItem}>
                <Avatar className={classes.avatar}>
                  <AvatarIcons
                    customProps={classes.icons}
                    i={tokenProps.baseToken.avatarID}
                  />
                </Avatar>
              </div>
            </Grid>
            <Grid
              item
              container
              direction="row"
              spacing={2}
              xs={12}
              //   className={classes.itemCenter}
            >
              <Grid item xs={6} className={classes.itemCenter}>
                <Typography variant="h5" style={{ textAlign: "center" }}>
                  <b>
                    $
                    {ethers.utils.formatEther(
                      tokenProps.baseToken.paymentValue
                    )}
                  </b>
                </Typography>
                <Typography variant="subtitle1" style={{ textAlign: "center" }}>
                  Dai/Month
                </Typography>
              </Grid>
              <Grid item xs={6} className={classes.itemCenter}>
                <div className={classes.divTest}>
                  <Typography
                    variant="subtitle1"
                    style={{ alignSelf: "flex-end" }}
                  >
                    1 of{"  "}
                  </Typography>
                  <Typography variant="h5" style={{ textAlign: "flex-end" }}>
                    <b>
                      {new BigNumber(tokenProps?.baseToken.initialSupply).gt(
                        10000
                      ) ? (
                        <AllInclusiveIcon
                          style={{
                            fontSize: "2.125rem",
                            marginBottom: -10,
                          }}
                        />
                      ) : (
                        tokenProps.baseToken.initialSupply
                      )}
                    </b>{" "}
                  </Typography>
                </div>
                <Typography variant="subtitle1" style={{ textAlign: "center" }}>
                  tokens
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={12} className={classes.itemCenter}>
              <Button
                variant="contained"
                className={classes.buy}
                onClick={handleUnsubscribe}
              >
                Unsubscribe
              </Button>
            </Grid>
            <Grid item xs={12} className={classes.itemDescription}>
              <Typography className={classes.about} variant="subtitle2">
                About this tier:
              </Typography>
              <Typography className={classes.description} variant="h6">
                {tokenProps.baseToken.description}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <ConfirmationModal props={confirmModal} />
    </>
  );
}
