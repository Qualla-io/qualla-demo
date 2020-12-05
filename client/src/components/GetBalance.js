import React, {useEffect, useRef, useState} from "react";
import {gql, useSubscription} from "@apollo/client";
import {Typography} from "@material-ui/core";
import {ethers} from "ethers";
import {useSnackbar} from "notistack";

const SUBSCRIBE_BALANCE = gql`
  subscription subscribeBalance($id: ID!) {
    daiBalance(id: $id) {
      id
      balance
    }
  }
`;

export default function UserBalance(props) {
  const {enqueueSnackbar} = useSnackbar();
  let [balance, setBalance] = useState("0.0");
  const {data, error, loading} = useSubscription(SUBSCRIBE_BALANCE, {
    variables: {id: props.id},
  });

  const ref = useRef(null);

  useEffect(() => {
    if (
      data &&
      ref.current &&
      data?.daiBalance?.balance.toString() !== balance
    ) {
      enqueueSnackbar(`${props.balName} Balance Updated`, {
        variant: "success",
      });
    }
    setBalance(data?.daiBalance?.balance.toString());
    ref.current = data;
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
