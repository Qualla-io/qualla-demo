import React, { useEffect, useRef, useState } from "react";
import { gql, useReactiveVar, useSubscription } from "@apollo/client";
import { Typography } from "@material-ui/core";
import { ethers } from "ethers";
import { useSnackbar } from "notistack";
import { accountVar } from "../cache";

const SUBSCRIBE_BALANCE = gql`
  subscription subscribeBalance($id: ID!) {
    daiBalance(id: $id) {
      id
      balance
    }
  }
`;

export default function UserBalance(props) {
  const { enqueueSnackbar } = useSnackbar();
  let [balance, setBalance] = useState("0.0");
  let account = useReactiveVar(accountVar);
  const { data } = useSubscription(SUBSCRIBE_BALANCE, {
    variables: { id: account },
  });

  const ref = useRef(null);

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
    <div>
      <Typography>
        $
        {data?.daiBalance?.balance
          ? ethers.utils.formatEther(data.daiBalance.balance)
          : "---"}{" "}
        Dai
      </Typography>
    </div>
  );
}
