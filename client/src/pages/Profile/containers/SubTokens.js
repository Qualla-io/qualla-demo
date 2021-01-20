import React from "react";

import { useRouteMatch } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_CREATOR_OVERVIEW } from "../queries";
import { makeStyles } from "@material-ui/core/styles";
import SubCard from "../components/SubCard";
// import CustomGridlist from "../../../containers/CustomGridlist";

import { GridListTile } from "@material-ui/core";

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
    // overflow: "hidden",
    flexGrow: 1,
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

export default function SubTokens() {
  const classes = useStyles();
  const { url } = useRouteMatch();
  const { data } = useQuery(GET_CREATOR_OVERVIEW, {
    variables: { id: url.slice(1).toLowerCase() },
  });

  return (
    <div>
      {/* <div className={classes.cardsDiv}>
        {data?.user?.baseTokens?.length > 0 ? (
          <CustomGridlist name="SubTokens">
            {data?.user?.baseTokens?.map((token, i) => (
              <GridListTile key={i} className={classes.cardTile}>
                <SubCard token={token} className={classes.card} />
              </GridListTile>
            ))}
          </CustomGridlist>
        ) : (
          <div className={classes.blankCard}>
          </div>
        )}
      </div> */}
    </div>
  );
}
