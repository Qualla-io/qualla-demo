import React, {useEffect, useRef, useState} from "react";
import {gql, useSubscription} from "@apollo/client";
import {Typography} from "@material-ui/core";
import {ethers} from "ethers";
import {useSnackbar} from "notistack";

const SUBSCRIBE_ALLOWANCE = gql`
  subscription SubscriberAllowance($id: ID!, $contractID: ID!) {
    daiAllowance(id: $id, contractID: $contractID) {
      id
      balance
    }
  }
`;

export default function UserAllowance(props) {
  const {enqueueSnackbar} = useSnackbar();
  let [allowance, setAllowance] = useState("0.0");
  const {data, error, loading} = useSubscription(SUBSCRIBE_ALLOWANCE, {
    variables: {id: props.id, contractID: props.contractID},
  });

  const ref = useRef(null);

  useEffect(() => {

    if (
      data &&
      ref.current &&
      data?.daiAllowance?.balance.toString() !== allowance
    ) {
      enqueueSnackbar(`${props.balName} Balance Updated`, {
        variant: "success",
      });
    }

    setAllowance(data?.daiAllowance?.balance.toString());
    ref.current = data;

  }, [data]);

  return (
    <div>
      <Typography>
        $
        {data?.daiAllowance?.balance
          ? ethers.utils.formatEther(data.daiAllowance.balance)
          : "---"}{" "}
        Dai
      </Typography>
    </div>
  );
}
