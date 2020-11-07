import React, {useState, useEffect} from "react";
import Button from "@material-ui/core/Button";
import {useSelector} from "react-redux";
import {useDispatch} from "react-redux";
import axios from "axios";
import {makeStyles} from "@material-ui/core/styles";
import {useSnackbar} from "notistack";
import {ethers} from "ethers";
import * as creatorActions from "../../../store/actions/CreatorActions";
import {Typography} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    direction: "row",
  },
  btn: {},
  balance: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    display: "flex",
    direction: "column",
    justify: "center",
    alignItems: "center",
  },
}));

export default function ActivateSubs() {
  const [allowance, setAllowance] = useState(0);
  const {enqueueSnackbar} = useSnackbar();
  const classes = useStyles();
  const web3State = useSelector((state) => state.Web3Reducer);
  const creatorState = useSelector((state) => state.CreatorReducer);

  const dispatch = useDispatch();

  function updateContract() {
    dispatch(creatorActions.updateContract());
  }

  useEffect(() => {
    subscribeAllowance();
  }, [creatorState.contract]);

  function subscribeAllowance() {
    if (creatorState.contract.subscribers) {
      if (creatorState.contract.subscribers.length > 0) {
        let subsciberAddress = creatorState.contract.subscribers[0].subscriber;
        let filterAllowance = web3State.Dai.filters.Approval(
          subsciberAddress,
          null
        );

        let filterTransfer = web3State.Dai.filters.Transfer(
          subsciberAddress,
          creatorState.contract.address
        );

        let handleApproval = async function (src, guy, wad) {
          web3State.Dai.allowance(
            subsciberAddress,
            creatorState.contract.address
          ).then((allowance) => {
            setAllowance(ethers.utils.formatEther(allowance));
          });
        };

        web3State.Dai.on(filterAllowance, handleApproval);
        web3State.Dai.on(filterTransfer, handleApproval);
      }
    }
  }

  function activateSub() {
    enqueueSnackbar(`Request Sent`, {
      variant: "success",
      autoHideDuration: 2000,
    });
    axios
      .post("http://localhost:8080/fakesub", {publisher: web3State.account})
      .then((res) => {
        updateContract();
        enqueueSnackbar(res.data, {
          variant: "success",
          autoHideDuration: 2000,
        });
      });
  }

  return (
    <div className={classes.root}>
      <Button
        variant="contained"
        color="secondary"
        onClick={activateSub}
        className={classes.btn}
      >
        Activate Subscriber!
      </Button>
      <div className={classes.balance}>
        <Typography>Subscriber Balance: ${allowance}</Typography>
      </div>
    </div>
  );
}
