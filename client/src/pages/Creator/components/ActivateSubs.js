import React, {useState, useEffect} from "react";
import {ethers} from "ethers";
import {gql, useReactiveVar, useMutation} from "@apollo/client";
import {useSnackbar} from "notistack";

import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";
import {Typography} from "@material-ui/core";

import {useQueryWithAccount} from "../../../hooks";
import {daiVar} from "../../../cache";

const ACTIVATE_SUBS_INFO = gql`
  query getActiveSubsInfo($id: ID!) {
    user(id: $id) {
      id
      contract {
        id
        subscribers {
          subscriber {
            id
          }
        }
      }
    }
  }
`;

const ACTIVATE_SUB = gql`
  mutation fakeSub($contract: ID!) {
    fakeSub(contract: $contract) {
      id
      subscribers {
        id
      }
    }
  }
`;

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
  const {error, loading, data} = useQueryWithAccount(ACTIVATE_SUBS_INFO);
  const [activateSub] = useMutation(ACTIVATE_SUB);
  let dai = useReactiveVar(daiVar);
  const {enqueueSnackbar} = useSnackbar();
  const classes = useStyles();

  // function updateContract() {
  //   dispatch(creatorActions.updateContract());
  // }

  useEffect(() => {
    if (data && data.user && data.user.contract) {
      subscribeAllowance();
    }
  }, [data]);

  async function subscribeAllowance() {
    if (
      data &&
      data.user &&
      data.user.contract &&
      data.user.contract.subscribers.length > 0
    ) {
      // console.log(data.user.contract.subscribers[0].subscriber);
      let subscriberID = data.user.contract.subscribers[0].subscriber.id;
      let filterAllowance = dai.filters.Approval(subscriberID, null);
      let filterTransfer = dai.filters.Transfer(
        subscriberID,
        data.user.contract.id
      );

      let handleApproval = async function (src, guy, wad) {
        dai.allowance(subscriberID, data.user.contract.id).then((allowance) => {
          setAllowance(ethers.utils.formatEther(allowance));
        });
      };
      dai.on(filterAllowance, handleApproval);
      dai.on(filterTransfer, handleApproval);

      handleApproval();
    }
  }

  function _activateSub() {
    activateSub({variables: {contract: data.user.contract.id}})
      .then((data) => {
        enqueueSnackbar("Subscription Successful", {
          variant: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar(`${err.message}`, {
          variant: "error",
        });
      });

    enqueueSnackbar(`Request Sent`, {
      variant: "success",
    });
  }

  return (
    <div className={classes.root}>
      <Button
        variant="contained"
        color="secondary"
        onClick={_activateSub}
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
