import {
  Grid,
  Typography,
  makeStyles,
  Collapse,
  Button,
} from "@material-ui/core";
import BigNumber from "bignumber.js";
import React, { useState, useEffect } from "react";
import BaseTokenCard from "./BaseTokenCard";

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
  collapse: {
    marginTop: theme.spacing(2),
    width: "100%",
    display: "flex-inline",
  },
  collapseBtn: {
    backgroundColor: theme.palette.tertiary.main,
    marginRight: 0,
    marginLeft: theme.spacing(2),
  },
}));

export default function BaseTokens({ userProps, accountProps }) {
  const classes = useStyles();
  const [baseTokens, setBaseTokens] = useState([]);
  const [collapse, setCollapse] = useState(false);
  const [collapseUpper, setCollapseUpper] = useState(true);

  useEffect(() => {
    if (userProps?.baseTokens) {
      let temp = [...userProps?.baseTokens];
      temp = temp.sort((a, b) =>
        new BigNumber(a.paymentValue).gt(b.paymentValue) ? 1 : -1
      );
      setBaseTokens(temp);
    }
  }, [userProps]);

  useEffect(() => {
    if (accountProps?.subscriptions?.length > 0) {
      setCollapseUpper(false);
    }
  }, [accountProps]);

  return (
    <>
      <div className={classes.div}>
        <Typography variant="h4" className={classes.title}>
          <b>
            {" "}
            {accountProps?.subscriptions.length > 0
              ? "Available Tiers:"
              : "Select a Tier:"}
          </b>
        </Typography>
        {accountProps?.subscriptions.length > 0 ? (
          <Button
            variant="contained"
            className={classes.collapseBtn}
            size="large"
            onClick={() => {
              setCollapseUpper(!collapseUpper);
            }}
          >
            {!collapseUpper ? "Show" : "Hide"}
          </Button>
        ) : null}
      </div>
      <Collapse in={collapseUpper} className={classes.collapse} unmountOnExit>
        <Grid container justify="center" spacing={2} style={{ flexGrow: 1 }}>
          {baseTokens?.slice(0, 3).map((token, key) => (
            <Grid item xs={12} md={4} key={key}>
              <BaseTokenCard tokenProps={token} accountProps={accountProps} />
            </Grid>
          ))}
        </Grid>
      </Collapse>
      {baseTokens?.length > 3 ? (
        <>
          <Collapse in={!collapse} className={classes.collapse} unmountOnExit>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                className={classes.collapseBtn}
                size="large"
                onClick={() => setCollapse(true)}
              >
                See all {baseTokens.length} Tiers
              </Button>
            </div>
          </Collapse>
          <Collapse in={collapse} className={classes.collapse} unmountOnExit>
            <Grid
              container
              justify="center"
              spacing={2}
              style={{ flexGrow: 1 }}
            >
              {baseTokens?.slice(3, baseTokens.length).map((token, key) => (
                <Grid item xs={12} md={4}>
                  <BaseTokenCard
                    tokenProps={token}
                    accountProps={accountProps}
                  />
                </Grid>
              ))}
            </Grid>
          </Collapse>
        </>
      ) : null}
    </>
  );
}
