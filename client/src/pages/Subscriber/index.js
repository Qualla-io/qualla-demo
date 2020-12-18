import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Link, Route, useParams, useRouteMatch } from "react-router-dom";

import Container from "@material-ui/core/Container";
import HeroImage from "./components/HeroImage";
import CreatorAvatar from "./components/CreatorAvatar";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SubTokens from "./containers/SubTokens";

import { GET_USER_SUBTOKENS } from "./queries";
import OwnedTokens from "./containers/OwnedTokens";
import { useQueryWithAccount } from "../../hooks";

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
  const [found, setFound] = useState(false);
  const { url, path } = useRouteMatch();
  const { error, loading, data } = useQueryWithAccount(GET_USER_SUBTOKENS);

  // This should really move to the backend and be a filter on the query
  useEffect(() => {
    for (var i = 0; i < data?.user?.subscriptions.length; i++) {
      if (data?.user?.subscriptions[i]?.creator?.id === url.slice(1)) {
        setFound(true);
      }
    }
  }, [data]);

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
        {found ? (
          <>
            <Typography variant="h5" className={classes.tierTitle}>
              Your subscriptions:
            </Typography>
            <OwnedTokens />
          </>
        ) : (
          <>
            <Typography variant="h5" className={classes.tierTitle}>
              Buy a subscription token:
            </Typography>
            <SubTokens />
          </>
        )}
      </Container>
    </>
  );
}
