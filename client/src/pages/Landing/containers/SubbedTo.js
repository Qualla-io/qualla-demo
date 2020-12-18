import React from "react";

import { Button, GridListTile, Typography } from "@material-ui/core";
import GridList from "@material-ui/core/GridList";
import { makeStyles } from "@material-ui/core/styles";

import { useReactiveVar } from "@apollo/client";
import { GET_USER_SUBSCRIPTIONS } from "../queries";
import { accountVar } from "../../../cache";
import { useQueryWithAccount } from "../../../hooks";
import SubbedToCard from "../components/SubbedToCard";
import BlankSubbedToCard from "../components/BlankSubbedToCard";
import CustomGridlist from "../../../containers/CustomGridlist";
import FindCreatorCard from "../components/FindCreatorCard";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
  },
  cardsDiv: {
    marginTop: theme.spacing(2),
    marginRight: -140,
    marginLeft: -140,
    justifyContent: "space-around",
    overflow: "hidden",
    flexGrow: 1,
  },
  cards: {
    flexWrap: "nowrap !important",
    paddingLeft: 140,
    transform: "translateZ(0)",
    "&::-webkit-scrollbar": {
      width: "0em",
      height: "0em",
    },
  },
  card: {
    padding: theme.spacing(4),
  },
  blankCard: {
    paddingLeft: 140,
  },
  btn: {
    width: 175,
    marginTop: theme.spacing(2),
    borderRadius: 10,
  },
}));

export default function SubbedTo() {
  const classes = useStyles();
  let account = useReactiveVar(accountVar);
  const { error, loading, data } = useQueryWithAccount(GET_USER_SUBSCRIPTIONS);

  return (
    <div className={classes.root}>
      <Typography variant="h4">
        <b>Subscribed To:</b>
      </Typography>
      <div className={classes.cardsDiv}>
        {data?.user?.subscriptions?.length > 0 ? (
          <CustomGridlist name={"subbedTo"}>
            {data?.user?.subscriptions.map((token, i) => (
              <GridListTile key={i} className={classes.cardTile}>
                <SubbedToCard token={token} className={classes.card} />
              </GridListTile>
            ))}
            <GridListTile>
              <FindCreatorCard />
            </GridListTile>
          </CustomGridlist>
        ) : (
          <div className={classes.blankCard}>
            <BlankSubbedToCard />
          </div>
        )}
      </div>
    </div>
  );
}
