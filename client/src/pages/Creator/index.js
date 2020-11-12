import React, {useEffect} from "react";
import {useSelector} from "react-redux";

import {makeStyles} from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";

import Alert from "@material-ui/lab/Alert";
import CreatorOverview from "./components/Overview";
import CreatorLaunchCard from "./components/LaunchCard";
import ActivateSubBtn from "./components/ActivateSubs";

import {gql, useReactiveVar, useLazyQuery} from "@apollo/client";
import {accountVar} from "../../cache";
import { useQueryWithAccount } from "../../hooks";

const GET_CONTRACT = gql`
  query getContract($id: ID!) {
    contract(id: $id) {
      id
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  headings: {
    marginTop: theme.spacing(4),
  },
}));

export default function Creator() {
  let account = useReactiveVar(accountVar);
  const {loading, error, data} = useQueryWithAccount(GET_CONTRACT);
  const classes = useStyles();

  if (error) console.log(error);

  return (
    <Container>
      {data && data.contract ? null : (
        <Alert severity="info" className={classes.headings}>
          You do not currently have an active subscription contract. Fill out
          your contract tiers and launch your contract below!
        </Alert>
      )}

      <Typography gutterBottom variant="h4" className={classes.headings}>
        Overview
      </Typography>
      <CreatorOverview />
      <div className={classes.headings}>
        {data && data.contract ? <ActivateSubBtn /> : null}
      </div>
      <Typography gutterBottom variant="h4" className={classes.headings}>
        Subscription Contract
      </Typography>
      <CreatorLaunchCard />
    </Container>
  );
}
