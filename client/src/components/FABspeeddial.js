import React, { useRef, useState } from "react";
import { useSnackbar } from "notistack";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import ShareIcon from "@material-ui/icons/Share";
import FeedbackIcon from "@material-ui/icons/Feedback";
import RepeatIcon from "@material-ui/icons/Repeat";
import DiscordBlackIcon from "../img/Discord-Logo-Black.svg";
import { MINT } from "./queries";
import { useMutation, useReactiveVar } from "@apollo/client";
import { accountVar } from "../cache";
import Tour from "./Tour";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: 1000,
  },
  speedDial: {
    // backgroundColor: theme.palette.secondary.main,
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 1001,
  },
}));

export default function FABspeeddial() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  let [mint] = useMutation(MINT);
  let account = useReactiveVar(accountVar);
  const { enqueueSnackbar } = useSnackbar();

  const actions = [
    {
      icon: <AttachMoneyIcon onClick={_mint} style={{ color: "#000" }} />,
      name: "Mint",
    },
    {
      icon: (
        <RepeatIcon
          onClick={() => {
            tourRef.current.startTour();
          }}
        ></RepeatIcon>
      ),
      name: "Tour",
    },
    { icon: <FeedbackIcon style={{ color: "#000" }} />, name: "Feedback" },
    {
      icon: <DiscordBlackIcon style={{ width: 25 }} />,
      name: "Support",
    },
    { icon: <ShareIcon style={{ color: "#000" }} />, name: "Share" },
  ];

  async function _mint() {
    mint({ variables: { userID: account, amt: "100" } })
      .then((_data) => {
        enqueueSnackbar(`haha money printer go BRRRRRRR`, {
          variant: "success",
        });
      })
      .catch((err) => {
        enqueueSnackbar(`${err}`, {
          variant: "error",
        });
      });
  }

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const tourRef = useRef();
  return (
    <>
      <Tour ref={tourRef}></Tour>
      <Backdrop open={open} className={classes.backdrop} />
      <SpeedDial
        color="secondary"
        ariaLabel="SpeedDial tooltip"
        className={classes.speedDial}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={handleClose}
          />
        ))}
      </SpeedDial>
    </>
  );
}
