import React from "react";
import { ethers } from "ethers";
import { cardStyles } from "./styles";
import { Avatar, Typography } from "@material-ui/core";
import AndroidIcon from "@material-ui/icons/Android";
import AvatarIcons from "../../../components/AvatarIcons";

export default function BaseTokenCard(props) {
  const classes = cardStyles();
  let token = props.token;

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
              .formatEther(token?.paymentValue.toString())
              .toString()}
          </b>
        </Typography>
        <Typography display="inline">{` `}Dai/mo.</Typography>
      </div>
      <div className={classes.content}>
        <Typography variant="h5" display="inline">
          <b>{token?.activeTokens?.length}</b>
        </Typography>
        <Typography display="inline">{` `}Subs</Typography>
      </div>
    </div>
  );
}
