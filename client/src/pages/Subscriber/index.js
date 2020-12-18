import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Link, Route, useParams, useRouteMatch } from "react-router-dom";

import Container from "@material-ui/core/Container";
import HeroImage from "./components/HeroImage";
import CreatorAvatar from "./components/CreatorAvatar";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SubTokens from "./containers/SubTokens";
// import TierContainer from "./components/TierContainer";

const useStyles = makeStyles((theme) => ({
  heading: {
    marginTop: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tierTitle: {
    marginTop: theme.spacing(5),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function Subscriber() {
  const classes = useStyles();
  const { name } = useParams();
  const { url, path } = useRouteMatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <HeroImage />
      <Container>
        <CreatorAvatar />
        <Typography variant="h2" className={classes.heading}>
          Qualla
        </Typography>
        <Typography variant="subtitle1" className={classes.subtitle}>
          A decentralized platorm for creators to take control
        </Typography>
        <Typography variant="h5" className={classes.tierTitle}>
          Buy a subscription token:
        </Typography>
        <SubTokens />
      </Container>
    </>
  );
}
