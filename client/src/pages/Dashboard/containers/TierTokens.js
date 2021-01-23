import { Grid, makeStyles } from "@material-ui/core";
import React, { useState } from "react";
import { useQueryWithAccountNetwork } from "../../../hooks";
import AddTokensCard from "../components/TierTokens/AddTokensCard";
import TokenCard from "../components/TierTokens/TokenCard";
import { GET_USER_BASETOKENS } from "../queries";

import Alert from "@material-ui/lab/Alert";
import MintModal from "../components/TierTokens/MintModal";

const useStyles = makeStyles((theme) => ({
  main: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
  },
}));

export default function TierTokens() {
  const classes = useStyles();
  const { data } = useQueryWithAccountNetwork(GET_USER_BASETOKENS);
  const [modalOpen, setModalOpen] = useState(false);


  return (
    <>
      <Grid container spacing={2} className={classes.main}>
        {data?.user?.baseTokens?.length > 0 ? null : (
          <Grid item xs={12}>
            <Alert severity="info">
              {" "}
              No active Tier Tokens! Mint some below to get started:{" "}
            </Alert>
          </Grid>
        )}
        {data?.user?.baseTokens.map((token, i) => (
          <Grid item xs={12} lg={4} key={i}>
            <TokenCard tokenProps={token} nonce={data?.user?.nonce} />
          </Grid>
        ))}
        <Grid item xs={12} md={4}>
          <AddTokensCard setModalOpen={setModalOpen} />
        </Grid>
      </Grid>
      <MintModal open={modalOpen} setOpen={setModalOpen} />
    </>
  );
}
