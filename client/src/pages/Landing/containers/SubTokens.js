import React from "react";

import { GridListTile, Typography } from "@material-ui/core";
import GridList from "@material-ui/core/GridList";
import { makeStyles } from "@material-ui/core/styles";

import { useReactiveVar } from "@apollo/client";
import { GET_USER_BASETOKENS } from "../queries";
import { accountVar } from "../../../cache";
import { useQueryWithAccount } from "../../../hooks";
import BaseTokenCard from "../components/BaseTokenCard";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
  },
  cardsDiv: {
    marginTop: theme.spacing(2),
    justifyContent: "space-around",
    overflow: "hidden",
    flexGrow: 1,
  },
  cards: {
    flexWrap: "nowrap !important",
    transform: "translateZ(0)",
    "&::-webkit-scrollbar": {
      width: "0.3em",
      height: "0.3em",
    },
  },
  cardTile: {},
  card: {
    padding: theme.spacing(4),
  },
}));

export default function SubTokens() {
  const classes = useStyles();
  let account = useReactiveVar(accountVar);
  const { error, loading, data } = useQueryWithAccount(GET_USER_BASETOKENS);

  const handleWheel = (e) => {
    e.preventDefault();
    const container = document.getElementById("container");
    const containerScrollPos = document.getElementById("container").scrollLeft;
    container.scrollTo({
      top: 0,
      left: containerScrollPos + e.deltaY,
      behaviour: "smooth",
    });
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4">
        <b>Subscription Tokens:</b>
      </Typography>
      <div className={classes.cardsDiv}>
        <GridList
          id="container"
          className={classes.cards}
          cellHeight={"auto"}
          cols={3.5}
          onWheel={handleWheel}
        >
          {data?.user?.baseTokens.map((token, i) => (
            <GridListTile key={i} className={classes.cardTile}>
              <BaseTokenCard token={token} className={classes.card} />
            </GridListTile>
          ))}
        </GridList>
      </div>
    </div>
  );
}
