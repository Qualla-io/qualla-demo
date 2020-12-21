import React from "react";
import { ethers } from "ethers";
import { cardStyles } from "./styles";
import { Avatar, Button, Typography } from "@material-ui/core";
import AndroidIcon from "@material-ui/icons/Android";
import AvatarIcons from "../../../components/AvatarIcons";
import { Link } from "react-router-dom";

export default function SubbedToCard(props) {
  let token = props.token;
  const classes = cardStyles();
  return (
    <div className={classes.card}>
      <Avatar className={classes.avatar}>
        <AvatarIcons customProps={classes.icons} i={token.baseToken.avatarID} />
      </Avatar>
      <div className={classes.content}>
        <Typography display="inline">Creator:</Typography>
      </div>
      <div>
        <Typography variant="h5" display="inline">
          {token?.creator?.id.slice(0, 5)}...{token?.creator?.id.slice(-5)}
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
        to={`/${token?.creator?.id}`}
        component={Link}
        variant="contained"
        color="secondary"
        className={classes.btn}
      >
        View
      </Button>
    </div>
  );
}
