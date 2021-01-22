import React from "react";

import Abra from "../img/UserAvatars/abra.svg";
import Bullbasaur from "../img/UserAvatars/bullbasaur.svg";
import Caterpie from "../img/UserAvatars/caterpie.svg";
import Charmander from "../img/UserAvatars/charmander.svg";
import Dratini from "../img/UserAvatars/dratini.svg";
import Eevee from "../img/UserAvatars/eevee.svg";
import Pikachu from "../img/UserAvatars/pikachu-2.svg";
import Pokeball from "../img/UserAvatars/pokeball.svg";
import Mew from "../img/UserAvatars/mew.svg";
import Squirtle from "../img/UserAvatars/squirtle.svg";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  default: {
    width: "80%",
  },
}));

export default function UserAvatars({ customProps, i }) {
  const classes = useStyles();
  const icons = [
    <Abra className={customProps ? customProps : classes.default} />,
    <Bullbasaur className={customProps ? customProps : classes.default} />,
    <Caterpie className={customProps ? customProps : classes.default} />,
    <Charmander className={customProps ? customProps : classes.default} />,
    <Dratini className={customProps ? customProps : classes.default} />,
    <Eevee className={customProps ? customProps : classes.default} />,
    <Pikachu className={customProps ? customProps : classes.default} />,
    <Pokeball className={customProps ? customProps : classes.default} />,
    <Mew className={customProps ? customProps : classes.default} />,
    <Squirtle className={customProps ? customProps : classes.default} />,
  ];
  return <>{icons[i]}</>;
}

export const avatarLength = 9;
