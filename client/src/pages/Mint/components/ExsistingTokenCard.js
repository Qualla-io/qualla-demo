import React, { useState } from "react";
import { ethers } from "ethers";
import { cardStyles } from "./styles";

import { BigNumber } from "bignumber.js";
import { Avatar, Typography, Button, TextField } from "@material-ui/core";
import AvatarIcons, { iconsLength } from "../../../components/AvatarIcons";
import ManageTokenModal from "./ManageTokenModal";

export default function ExsistingTokenCard(props) {
  const classes = cardStyles();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClose = () => {
    setModalOpen(false);
  };

  let token = props.token;
  return (
    <div className={classes.newCard}>
      <Avatar className={classes.avatar}>
        <AvatarIcons customProps={classes.icons} i={token.avatarID} />
      </Avatar>
      <Typography variant="h5">{token.title}</Typography>
      <Typography> {token.description}</Typography>
      {token.initialSupply < 100000 ? (
        <Typography>
          {token.quantity} of {token.initialSupply} Available
        </Typography>
      ) : (
        <>
          <Typography>Unlimited Subscriptions</Typography>
          <Typography>
            {token.quantity < 100000 ? token.quantity : "Unlimited"} Available
          </Typography>
        </>
      )}
      <Typography variant="h5" display="inline">
        <b>${ethers.utils.formatEther(token?.paymentValue).toString()}</b>
      </Typography>
      <Typography display="inline">{` `}Dai/mo.</Typography>
      <Button
        variant="contained"
        color="secondary"
        // disabled={token.quantity === "0"}
        onClick={() => setModalOpen(true)}
      >
        Manage
      </Button>
      <ManageTokenModal
        token={token}
        open={modalOpen}
        handleClose={handleClose}
      />
    </div>
  );
}
