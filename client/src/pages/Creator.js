import React from "react";

import {makeStyles} from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import {CardContent} from "@material-ui/core";
import CreatorOverview from "../components/CreatorOverview";
import CreatorLaunchCard from "../components/CreatorLaunchCard";

const useStyles = makeStyles((theme) => ({
  headings: {
    marginTop: theme.spacing(4),
  },
}));

export default function Creator() {
  const classes = useStyles();
  return (
    <Container>
      <Typography gutterBottom variant="h4" className={classes.headings}>
        Overview
      </Typography>
      <CreatorOverview />
      <Typography gutterBottom variant="h4" className={classes.headings}>
        Launch Subscription
      </Typography>
      <CreatorLaunchCard />
    </Container>
  );
}
