import React, {useState, useEffect} from "react";
import {ethers} from "ethers";
import produce from "immer";
import {gql, useReactiveVar, useMutation} from "@apollo/client";
import {useSnackbar} from "notistack";

import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";
import {Typography} from "@material-ui/core";

import {useQueryWithAccount} from "../../../hooks";
import {daiVar, accountVar} from "../../../cache";
import {cloneDeep} from "@apollo/client/utilities";

import {GET_USER_OVERVIEW} from "./Overview";
import UserAllowance from "./GetAllowance";

const ACTIVATE_SUBS_INFO = gql`
  query getActiveSubsInfo($id: ID!) {
    user(id: $id) {
      id
      contract {
        id
        subscribers {
          id
          value
          subscriber {
            id
          }
        }
      }
    }
  }
`;

const ACTIVATE_SUB = gql`
  mutation fakeSub($id: ID!) {
    fakeSub(id: $id) {
      id
      publisher {
        id
      }
      subscribers {
        id
        value
        subscriber {
          id
        }
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
  let account = useReactiveVar(accountVar);
  const {error, loading, data} = useQueryWithAccount(ACTIVATE_SUBS_INFO);
  const [activateSub] = useMutation(ACTIVATE_SUB);
  let dai = useReactiveVar(daiVar);
  const {enqueueSnackbar} = useSnackbar();
  const classes = useStyles();

  function _activateSub() {
    activateSub({
      variables: {id: data.user.contract.id},
      update(cache, {data}) {
        // const userData = cache.readQuery({
        //   query: ACTIVATE_SUBS_INFO,
        //   variables: {id: account},
        // });
        // console.log("updating");
        // let _userData = {...userData};
        // _userData.contract = data.fakeSub;
        // console.log(_userData.contract);
        // cache.writeQuery({
        //   query: GET_CONTRACT_OVERVIEW,
        //   variables: {id: account},
        //   data: {user: _userData},
        // });
        // cache.writeQuery({
        //   query: GET_CONTRACT_OVERVIEW,
        //   variables: {id: account},
        //   data: {user: _userData},
        // });
      },
    })
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
        // disabled={allowance > 0}
      >
        Activate Subscriber!
      </Button>
      <div className={classes.balance}>
        {data?.user?.contract?.subscribers?.length > 0 ? (
          <UserAllowance
            id={data.user.contract.subscribers[0].subscriber.id}
            contractID={data.user.contract.id}
            balName="Subscriber"
          />
        ) : null}
      </div>
    </div>
  );
}
