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
      width: "0em",
      height: "0em",
    },
  },
  cardTile: {},
  card: {
    padding: theme.spacing(4),
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

  const handleWheel = (e) => {
    e.preventDefault();
    const container = document.getElementById("subToContainer");
    const containerScrollPos = document.getElementById("subToContainer")
      .scrollLeft;
    container.scrollTo({
      top: 0,
      left: containerScrollPos + e.deltaY,
      behaviour: "smooth",
    });
  };

  function preventDefault(e) {
    e.preventDefault();
  }

  var supportsPassive = false;
  try {
    window.addEventListener(
      "test",
      null,
      Object.defineProperty({}, "passive", {
        get: function () {
          supportsPassive = true;
        },
      })
    );
  } catch (e) {}

  var wheelOpt = supportsPassive ? { passive: false } : false;
  var wheelEvent =
    "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";

  const disableScroll = () => {
    window.addEventListener("DOMMouseScroll", preventDefault, false); // older FF
    window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
    window.addEventListener("touchmove", preventDefault, wheelOpt); // mobile
  };

  const enableScroll = () => {
    window.removeEventListener("DOMMouseScroll", preventDefault, false);
    window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
    window.removeEventListener("touchmove", preventDefault, wheelOpt);
  };
  return (
    <div className={classes.root}>
      <Typography variant="h4">
        <b>Subscribed To:</b>
      </Typography>
      <div className={classes.cardsDiv}>
        {data?.user?.subscriptions.length > 0 ? (
          <GridList
            id="subToContainer"
            className={classes.cards}
            cellHeight={"auto"}
            cols={0}
            onWheel={handleWheel}
            onMouseWheel={handleWheel}
            onMouseEnter={disableScroll}
            onMouseLeave={enableScroll}
          >
            {data?.user?.subscriptions.map((token, i) => (
              <GridListTile key={i} className={classes.cardTile}>
                <SubbedToCard token={token} className={classes.card} />
              </GridListTile>
            ))}
          </GridList>
        ) : (
          <BlankSubbedToCard />
        )}
      </div>
    </div>
  );
}
