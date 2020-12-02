import React, {useEffect, useState} from "react";
import ethers from "ethers";
import {gql, useLazyQuery, useReactiveVar} from "@apollo/client";
import {BigNumber} from "bignumber.js";

import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import CardContent from "@material-ui/core/CardContent";
import Hidden from "@material-ui/core/Hidden";

import {GET_USER_DETAILS} from "./LaunchCard";

import {accountVar, contractIDVar} from "../../../cache";
import {useQueryWithAccount} from "../../../hooks";

// export const GET_CONTRACT_OVERVIEW = gql`
//   query getUserContractDetails($id: ID!) {
//     contract(id: $id) {
//       id
//       tiers {
//         id
//       }
//       factory {
//         id
//         fee
//       }
//       subscribers {
//         subscriber {
//           id
//         }
//         id
//         value
//         status
//       }
//     }
//   }
// `;

export default function CreatorOverview() {
  let account = useReactiveVar(accountVar);
  let contractID = useReactiveVar(contractIDVar);
  const {error, loading, data} = useQueryWithAccount(GET_USER_DETAILS);

  // let [sendQuery, {error, loading, data}] = useLazyQuery(
  //   GET_CONTRACT_OVERVIEW,
  //   {
  //     // fetchPolicy: "cache-only",
  //   }
  // );

  let [value, setValue] = useState(0);

  // useEffect(() => {
  //   if (contractID) {
  //     console.log(contractID);
  //     sendQuery({variables: {id: contractID}});
  //   }
  // }, [contractID]);

  useEffect(() => {
    if (data?.user?.contract) {

      let subscribers = data.user.contract.subscribers;
      let subValue = 0;
      for (var i = 0; i < subscribers.length; i++) {
        if (subscribers[i].status === "ACTIVE") {
          let val = new BigNumber(subscribers[i].value);

          subValue = +subValue + +ethers.utils.formatEther(val.toFixed());
        }
      }

      setValue((subValue * (100 - data.user.contract.factory.fee)) / 100);
    }
  }, [data]);

  return (
    <Grid container alignItems="stretch">
      <Grid item component={Card} xs={12} lg={6}>
        <Grid
          container
          component={CardContent}
          spacing={5}
          justify="center"
          alignItems="center"
        >
          <Grid item xs={12} md>
            <Typography variant="h6">
              {" "}
              {data?.user?.contract ? data.user.contract.subscribers.length : 0}
            </Typography>
            <Typography variant="subtitle1">Subscribers</Typography>
          </Grid>
          <Hidden mdDown>
            <Divider orientation="vertical" flexItem />
          </Hidden>
          <Hidden mdUp>
            <Divider variant="middle" />
          </Hidden>
          <Grid item xs={12} md>
            <Typography variant="h6">
              {data?.user?.contract?.tiers ? data.user.contract.tiers.length : 0}
            </Typography>
            <Typography variant="subtitle1">Active Teirs</Typography>
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid item xs={12} md>
            <Typography variant="h6">$ {value}</Typography>
            <Typography variant="subtitle1">Dai/month (projected)</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
