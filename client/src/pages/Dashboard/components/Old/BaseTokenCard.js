import React from "react";
import { ethers } from "ethers";
// import { BigNumber } from "bignumber.js";
import { useSnackbar } from "notistack";
import { useMutation } from "@apollo/client";

import { cardStyles } from "../styles";
import { Avatar, Button, Typography } from "@material-ui/core";
import AvatarIcons from "../../../../components/AvatarIcons";

import { ADD_SUB } from "../../queries";

export default function BaseTokenCard(props) {
  const classes = cardStyles();
  let [addSub] = useMutation(ADD_SUB);
  const { enqueueSnackbar } = useSnackbar();
  let token = props.token;

  async function _addSub() {
    // console.log(token);
    if (token?.activeTokens?.length > 1) {
      enqueueSnackbar(`Maximum subscribers reached for demo`, {
        variant: "warning",
      });
      return;
    }

    await addSub({
      variables: { baseTokenID: token.id },
      // update(cache) {
      //   cache.modify({
      //     id: cache.identify({
      //       id: token.id,
      //       __typename: "BaseToken",
      //     }),
      //     fields: {
      //       activeTokens(cachedTokens) {
      //         let newToken = {
      //           id: Math.floor(Math.random() * (10000 - 1 + 1)) + 1,
      //         };
      //         return [...cachedTokens, newToken];
      //       },
      //     },
      //   });
      // },
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
          <b>${ethers.utils.formatEther(token?.paymentValue).toString()}</b>
        </Typography>
        <Typography display="inline">{` `}Dai/mo.</Typography>
      </div>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          <b>{token?.activeTokens?.length}</b>
        </Typography>
        <Typography display="inline">{` `}Subs</Typography>
      </div>
      <div className={classes.content}>
        <Button
          className="addSubButton"
          color="secondary"
          variant="contained"
          onClick={_addSub}
        >
          Add Subscriber
        </Button>
      </div>
    </div>
  );
}
