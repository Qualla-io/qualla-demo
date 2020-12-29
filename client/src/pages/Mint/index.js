import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import Alert from "@material-ui/lab/Alert";

import { useQueryWithAccount } from "../../hooks";

import { GET_USER_BASETOKENS } from "./queries";
import MintTokens from "./containers/MintTokens";
import ExsistingTokens from "./containers/ExsistingTokens";

const useStyles = makeStyles((theme) => ({
  headings: {
    marginTop: theme.spacing(4),
  },
}));

export default function Creator() {
  const { error, data } = useQueryWithAccount(GET_USER_BASETOKENS);
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
      <ExsistingTokens/>
    </Container>
  );
}
