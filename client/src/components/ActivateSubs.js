import React from "react";
import Button from "@material-ui/core/Button";
import {useSelector} from "react-redux";
import {useDispatch} from "react-redux";
import axios from "axios";
import {makeStyles} from "@material-ui/core/styles";
import {useSnackbar} from "notistack";

import * as creatorActions from "../store/actions/CreatorActions";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
}));

export default function ActivateSubs() {
  const {enqueueSnackbar} = useSnackbar();
  const classes = useStyles();
  const web3State = useSelector((state) => state.Web3Reducer);

  const dispatch = useDispatch();

  function updateContract() {
    dispatch(creatorActions.updateContract());
  }

  function activateSub() {
    enqueueSnackbar(`Request Sent`, {
      variant: "success",
      autoHideDuration: 2000,
    });
    axios
      .post("http://localhost:8080/fakesub", {publisher: web3State.account})
      .then((res) => {
        updateContract()
        enqueueSnackbar(res.data, {
          variant: "success",
          autoHideDuration: 2000,
        });
      });
  }

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        onClick={activateSub}
        className={classes.btn}
      >
        Activate Subscriber!
      </Button>
    </>
  );
}
