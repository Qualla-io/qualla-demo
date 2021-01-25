import React, { useEffect } from "react";
import { useReactiveVar, useMutation } from "@apollo/client";
import { Button, Typography } from "@material-ui/core";
import { ethers } from "ethers";
import { useSnackbar } from "notistack";
import { accountVar, balVar } from "../cache";
import { MINT, GET_BALANCE } from "./queries";

import { makeStyles } from "@material-ui/core/styles";
import { useQueryWithAccount } from "../hooks";
import BigNumber from "bignumber.js";

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
    backgroundColor: theme.palette.tertiary.main,
  },
}));

export default function UserBalance(props) {
  const { enqueueSnackbar } = useSnackbar();
  // let [balance, setBalance] = useState("0.0");
  let account = useReactiveVar(accountVar);
  let _balance = useReactiveVar(balVar);
  let { data } = useQueryWithAccount(GET_BALANCE);
  let [mint] = useMutation(MINT);

  // const ref = useRef(null);

  useEffect(() => {
    if (data?.user?.balance) {
      balVar(data.user.balance);
    }
  }, [data]);

  const classes = useStyles();

  async function _mint() {
    mint({
      variables: { userID: account, amt: "100" },
      update(cache) {
        cache.modify({
          id: cache.identify({
            id: account.toLowerCase(),
            __typename: "User",
          }),
          fields: {
            balance(cachedBal) {
              let bal;
              if (cachedBal) {
                bal = new BigNumber(cachedBal).plus("100000000000000000000");
              } else {
                bal = new BigNumber("100000000000000000000");
              }
              balVar(bal.toFixed());
              return bal.toFixed();
            },
          },
          // broadcast: false,
        });
      },
    })
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

  // useEffect(() => {
  //   if (data && ref.current && data?.user?.balance.toString() !== balance) {
  //     enqueueSnackbar(`Balance Updated`, {
  //       variant: "success",
  //     });
  //   }
  //   setBalance(data?.user?.balance?.toString());
  //   ref.current = data;
  //   // eslint-disable-next-line
  // }, [data]);

  return (
    <div className={classes.main}>
      <Typography>
        $
        {data?.user?.balance
          ? ethers.utils.formatEther(data?.user?.balance)
          : "0"}{" "}
        Dai
      </Typography>
      <Button variant="contained" className={classes.btn} onClick={_mint}>
        Mint
      </Button>
    </div>
  );
}
