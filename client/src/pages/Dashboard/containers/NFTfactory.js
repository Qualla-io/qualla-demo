import React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useQueryWithAccount } from "../../../hooks";
import NFTMintCard from "../components/NFTFactory/NFTMintCard";
import { GET_NFT_FACTORY_DATA } from "../components/NFTFactory/queries";

const useStyles = makeStyles((theme) => ({
  main: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
  },
}));

export default function NFTfactory() {
  const classes = useStyles();
  let { data } = useQueryWithAccount(GET_NFT_FACTORY_DATA);

  return (
    <>
      <Grid container spacing={2} className={classes.main}>
        <Grid item xs={12}>
          <NFTMintCard user={data?.user} baseTokens={data?.user?.baseTokens} />
        </Grid>
      </Grid>
    </>
  );
}
