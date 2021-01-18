import React, { useEffect, useRef, useState } from "react";
import {
  gql,
  useReactiveVar,
  useSubscription,
  useMutation,
} from "@apollo/client";
import { Button, Typography } from "@material-ui/core";
import { ethers } from "ethers";
import { useSnackbar } from "notistack";
import { accountVar } from "../cache";
import { MINT } from "./queries";

import { makeStyles } from "@material-ui/core/styles";

const SUBSCRIBE_BALANCE = gql`
  subscription subscribeBalance($id: ID!) {
    daiBalance(id: $id) {
      id
      balance
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  main: {
    display: "flex",
    direction: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btn: {
    borderRadius: 10,
    marginLeft: theme.spacing(2),
  },
}));

export default function UserBalance(props) {
  const { enqueueSnackbar } = useSnackbar();
  let [balance, setBalance] = useState("0.0");
  let account = useReactiveVar(accountVar);
  const { data } = useSubscription(SUBSCRIBE_BALANCE, {
    variables: { id: account },
  });
  let [mint] = useMutation(MINT);

  const ref = useRef(null);

  const classes = useStyles();

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

  useEffect(() => {
    if (
      data &&
      ref.current &&
      data?.daiBalance?.balance.toString() !== balance
    ) {
      enqueueSnackbar(`Balance Updated`, {
        variant: "success",
      });
    }
    setBalance(data?.daiBalance?.balance.toString());
    ref.current = data;
    // eslint-disable-next-line
  }, [data]);

  return (
    <div className={classes.main}>
      <Typography>
        $
        {data?.daiBalance?.balance
          ? ethers.utils.formatEther(data.daiBalance.balance)
          : "---"}{" "}
        Dai
      </Typography>
      <Button variant="contained" className={classes.btn} onClick={_mint}>
        Mint
      </Button>
    </div>
  );
}
