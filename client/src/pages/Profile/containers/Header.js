import React from 'react'
import { useRouteMatch } from "react-router-dom";
import { useQuery } from "@apollo/client";

import { GET_CREATOR_OVERVIEW } from "../queries";
import CreatorAvatar from "../components/CreatorAvatar";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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
}))

export default function Header() {
    const classes = useStyles();
    const { url } = useRouteMatch();
  const { error, loading, data } = useQuery(GET_CREATOR_OVERVIEW, {
    variables: { id: url.slice(1) },
  });
    return (
        <div>
             <CreatorAvatar />
        <Typography variant="h2" className={classes.heading}>
          {data?.user?.username || "USERNAME"}
        </Typography>
        <Typography variant="subtitle1" className={classes.subtitle}>
          A decentralized platorm for creators to take control
        </Typography>

        </div>
    )
}
