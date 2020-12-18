import React from "react";

import { cardStyles } from "./styles";
import { Avatar, Button, Typography } from "@material-ui/core";
import AndroidIcon from "@material-ui/icons/Android";

import { useReactiveVar, useMutation } from "@apollo/client";
import { UNSUBSCRIBE, GET_USER_NONCE } from "../queries";
import { accountVar, subscriptionVar, signerVar } from "../../../cache";
import { useQueryWithAccount } from "../../../hooks";

export default function OwnedSubCard(props) {
  const classes = cardStyles();
  let account = useReactiveVar(accountVar);
  let signer = useReactiveVar(signerVar);
  let subscriptionV1 = useReactiveVar(subscriptionVar);

  let { data } = useQueryWithAccount(GET_USER_NONCE);
  let [unsubscribe] = useMutation(UNSUBSCRIBE);
  let token = props.token;

  async function _unSub() {
    let subscriberData = {
      user: account,
      nonce: data?.user?.nonce,
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
        // delete subtoken from cache
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
    }).catch((err) => {
      console.log(err);
    });
  }

  return (
    <div className={classes.card}>
      <Avatar className={classes.avatar}>
        <AndroidIcon className={classes.icons} />
      </Avatar>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          Nickname
        </Typography>
      </div>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          <b>${token?.baseToken?.paymentValue}</b>
        </Typography>
        <Typography display="inline">{` `}Dai/mo.</Typography>
      </div>
      <Button
        variant="contained"
        color="secondary"
        className={classes.content}
        onClick={_unSub}
      >
        Unsubscribe
      </Button>
    </div>
  );
}
