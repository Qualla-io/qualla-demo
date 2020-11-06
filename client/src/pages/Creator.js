import React from "react";
import {useSelector} from "react-redux";

import {makeStyles} from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";

import Alert from "@material-ui/lab/Alert";
import CreatorOverview from "../components/CreatorOverview";
import CreatorLaunchCard from "../components/CreatorLaunchCard";
import ActivateSubBtn from "../components/ActivateSubs";

const useStyles = makeStyles((theme) => ({
  headings: {
    marginTop: theme.spacing(4),
  },
}));

export default function Creator() {
  const state = useSelector((state) => state.CreatorReducer);
  const classes = useStyles();
  return (
    <Container>
      {state.contract.address ? null : (
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
        {state.contract.address ? <ActivateSubBtn /> : null}
      </div>
      <Typography gutterBottom variant="h4" className={classes.headings}>
        Subscription Contract
      </Typography>
      <CreatorLaunchCard />
    </Container>
  );
}
