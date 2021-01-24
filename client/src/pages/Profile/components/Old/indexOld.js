import React, { useEffect } from "react";

import { useRouteMatch } from "react-router-dom";

import Container from "@material-ui/core/Container";
import HeroImage from "../HeroImage";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SubTokens from "../../containers/SubTokens";
import Header from "../../containers/Header";

import { GET_PROFILE, GET_USER_SUBSCRIBED_TO } from "../../queries";
import OwnedTokens from "../../containers/OwnedTokens";

import { useLazyQuery, useQuery, useReactiveVar } from "@apollo/client";
import { accountVar } from "../../../../cache";

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

export default function Profile() {
  const classes = useStyles();
  let account = useReactiveVar(accountVar);
  const { url } = useRouteMatch();
  let { data } = useQuery(GET_PROFILE, {
    variables: { url: url.substring(1) },
  });

  // const [sendSubscribedTo, { data }] = useLazyQuery(GET_USER_SUBSCRIBED_TO);

  // useEffect(() => {
  //   if (account) {
  //     sendSubscribedTo({
  //       variables: { userID: account, creatorID: url.slice(1).toLowerCase() },
  //       fetchPolicy: "cache-and-network",
  //     });
  //   }
  //   // eslint-disable-next-line
  // }, [account]);

  useEffect(() => {
    console.log(data);
  }, [data]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <HeroImage userProps={data?.getUserFromUrl} />
      <Container>
        <Header userProps={data?.getUserFromUrl} />
        {/* {data?.userSubscribedTo?.subscriptions?.length > 0 ? (
          <>
            <Typography variant="h5" className={classes.tierTitle}>
              Your subscriptions:
            </Typography>
            <OwnedTokens tokens={data?.userSubscribedTo.subscriptions} />
          </>
        ) : (
          <>
            <Typography variant="h5" className={classes.tierTitle}>
              Buy a subscription token:
            </Typography>
            <SubTokens />
          </>
        )} */}
      </Container>
    </>
  );
}
