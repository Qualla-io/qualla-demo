import React, { useEffect } from "react";

import { GridList } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  cards: {
    flexWrap: "nowrap !important",
    paddingLeft: 140,
    transform: "translateZ(0)",
    overflow: "scroll",
    "&::-webkit-scrollbar": {
      width: "0em",
      height: "0em",
    },
  },
}));

export default function CustomGridlist(props) {
  const classes = useStyles();

  useEffect(() => {
    return () => {
      enableScroll();
    };
  }, []);

  const handleWheel = (e) => {
    e.preventDefault();
    const container = document.getElementById(props.name);
    const containerScrollPos = document.getElementById(props.name).scrollLeft;
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
    <GridList
      id={props.name}
      className={classes.cards}
      cellHeight={"auto"}
      cols={0}
      onWheel={handleWheel}
      onMouseWheel={handleWheel}
      onMouseEnter={disableScroll}
      onMouseLeave={enableScroll}
    >
      {props.children}
    </GridList>
  );
}
