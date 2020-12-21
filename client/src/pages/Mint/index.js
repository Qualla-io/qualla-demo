import React, { useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";

import Alert from "@material-ui/lab/Alert";
// import CreatorOverview from "./components/Overview";
// import CreatorLaunchCard from "./components/LaunchCard";
// import ActivateSubBtn from "./components/ActivateSubs";

import { gql, useReactiveVar, useLazyQuery } from "@apollo/client";
import { accountVar } from "../../cache";
import { useQueryWithAccount } from "../../hooks";

import { GET_USER_BASETOKENS } from "./queries";
import MintTokens from "./containers/MintTokens";

const useStyles = makeStyles((theme) => ({
  headings: {
    marginTop: theme.spacing(4),
  },
}));

export default function Creator() {
  let account = useReactiveVar(accountVar);
  const { loading, error, data } = useQueryWithAccount(GET_USER_BASETOKENS);
  const classes = useStyles();

  if (error) console.log(error);

  return (
    <Container>
      {data?.user?.baseTokens?.length > 0 ? null : (
        <Alert severity="info" className={classes.headings}>
          You do not currently have any active subscription tokens. Mint your
          tokens below!
        </Alert>
      )}
      <MintTokens />

      {/* <Typography gutterBottom variant="h4" className={classes.headings}>
        Overview
      </Typography>
      <CreatorOverview />
      <div className={classes.headings}>
        {data?.user?.contract ? <ActivateSubBtn /> : null}
      </div>
      <Typography gutterBottom variant="h4" className={classes.headings}>
        Subscription Contract
      </Typography>
      <CreatorLaunchCard /> */}
    </Container>
  );
}
