import React, { useState, useEffect } from "react";

import { Grid, Typography, makeStyles } from "@material-ui/core";
import SubTokenCard from "./SubTokenCard";
import BigNumber from "bignumber.js";

const useStyles = makeStyles((theme) => ({
  div: {
    display: "flex",
    flexDirection: "Row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  title: {
    textAlign: "center",
    alignItems: "center",
  },
  container: {
    flexGrow: 1,
    marginBottom: theme.spacing(2),
  },
}));

export default function SubTokens({ tokenProps, accountProps }) {
  const classes = useStyles();
  const [subTokens, setSubTokens] = useState([]);

  useEffect(() => {
    if (tokenProps) {
      let temp = [...tokenProps];
      temp = temp.sort((a, b) =>
        new BigNumber(a.baseToken.paymentValue).gt(b.baseToken.paymentValue)
          ? 1
          : -1
      );
      setSubTokens(temp);
    }
  }, [tokenProps]);

  return (
    <>
      <div className={classes.div}>
        <Typography variant="h4" className={classes.title}>
          <b>Your Membership:</b>
        </Typography>
      </div>
      <Grid
        container
        justify="center"
        spacing={2}
        className={classes.container}
      >
        {subTokens?.map((token, key) => (
          <Grid item xs={12} md={4} key={key}>
            <SubTokenCard tokenProps={token} accountProps={accountProps} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
