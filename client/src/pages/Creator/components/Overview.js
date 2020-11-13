import React, {useEffect, useState} from "react";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import CardContent from "@material-ui/core/CardContent";
import Hidden from "@material-ui/core/Hidden";

import {gql, useReactiveVar, useQuery} from "@apollo/client";
import {accountVar} from "../../../cache";
import {useQueryWithAccount} from "../../../hooks";

const GET_CONTRACT_OVERVIEW = gql`
  query getContractDetails($id: ID!) {
    user(id: $id) {
      id
      contract {
        id
        tiers {
          title
        }
        subscribers {
          id
        }
      }
    }
  }
`;

export default function CreatorOverview() {
  let account = useReactiveVar(accountVar);
  const {error, loading, data} = useQueryWithAccount(GET_CONTRACT_OVERVIEW);
  let [value, setValue] = useState(0);

  useEffect(() => {
    // test this later
    if (data && data.user && data.user.contract) {
      let subscribers = data.user.contract.subscribers;

      let subValue = 0;
      for (var i = 0; i < subscribers.length; i++) {
        subValue = subValue + subscribers[i].value;
      }

      setValue(subValue);
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
              {data && data.user && data.user.contract
                ? data.user.contract.subscribers.length
                : 0}
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
              {data &&
              data.user &&
              data.user.contract &&
              data.user.contract.tiers
                ? data.user.contract.tiers.length
                : 0}
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
