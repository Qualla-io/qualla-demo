import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function ChainModal({open}) {


  return (
    <Dialog open={open}>
      <DialogTitle>Invalid Network</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This demo runs on the Rinkeby Testnet. Please change the network on
          your Ethereum wallet provider.
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
