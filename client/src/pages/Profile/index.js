import { Card, CardContent, Grid, makeStyles } from "@material-ui/core";
import React, { useEffect } from "react";
import { useRouteMatch } from "react-router-dom";
import { useLazyQuery, useQuery, useReactiveVar } from "@apollo/client";

import TopBar from "./components/TopBar";
import { GET_PROFILE, GET_USER_SUBSCRIBED_TO } from "./queries";
import ProfileNotFound from "./components/ProfileNotFound";
import Header from "./containers/Header";
import UserBalance from "../../components/UserBalance";
import BaseTokens from "./components/BaseTokens";
import Footer from "../../containers/Footer";
import { accountVar } from "../../cache";
import SubTokens from "./components/SubTokens";
import Posts from "./components/Posts";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "Column",
    justify: "center",
    alignItems: "center",
  },
  main: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
    maxWidth: theme.breakpoints.values.lg,
    justify: "center",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  content: {
    flexGrow: 1,
    paddingLeft: theme.spacing(9),
    paddingRight: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  balCard: {
    position: "fixed",
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: 1001,
  },
  balContent: {
    display: "flex",
    alignItems: "center",
  },
  item: {
    width: "100%",
  },
}));

export default function Profile() {
  const classes = useStyles();
  const account = useReactiveVar(accountVar);
  const { url } = useRouteMatch();
  const { data, loading } = useQuery(GET_PROFILE, {
    variables: { url: url.substring(1) },
  });

  const [sendQuery, { data: accountData }] = useLazyQuery(
    GET_USER_SUBSCRIBED_TO
  );

  useEffect(() => {
    if (account && data?.getUserFromUrl?.id) {
      sendQuery({
        variables: { userID: account, creatorID: data.getUserFromUrl.id },
      });
    }
  }, [account, data, sendQuery]);

  return (
    <>
      <div className={classes.content}>
        <TopBar />
      </div>
      <div className={classes.root}>
        {!loading && data?.getUserFromUrl ? (
          <>
            <Header userProps={data.getUserFromUrl} />
            <Grid
              container
              direction="column"
              justify="center"
              alignContent="center"
              spacing={2}
              className={classes.main}
            >
              {accountData?.userSubscribedTo?.subscriptions?.length > 0 ? (
                <Grid item xs={12} className={classes.item}>
                  <SubTokens
                    tokenProps={accountData?.userSubscribedTo?.subscriptions}
                    accountProps={accountData?.userSubscribedTo}
                  />
                </Grid>
              ) : null}

              <Grid item xs={12} className={classes.item}>
                <BaseTokens
                  userProps={data?.getUserFromUrl}
                  accountProps={accountData?.userSubscribedTo}
                />
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <Posts />
              </Grid>
            </Grid>
          </>
        ) : (
          <ProfileNotFound />
        )}

        <Footer />
      </div>
      <Card className={classes.balCard}>
        <CardContent className={classes.balContent}>
          <UserBalance />
        </CardContent>
      </Card>
    </>
  );
}
