import React, { useEffect, useState } from "react";

import { useRouteMatch } from "react-router-dom";

import { GridListTile } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { GET_USER_SUBTOKENS } from "../queries";
import { useQueryWithAccount } from "../../../hooks";

import OwnedSubCard from "../components/OwnedSubCard";
import CustomGridlist from "../../../containers/CustomGridlist";

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

export default function OwnedTokens() {
  const classes = useStyles();
  const [tokens, setTokens] = useState([]);
  const { error, loading, data } = useQueryWithAccount(GET_USER_SUBTOKENS);
  const { url, path } = useRouteMatch();

  // This should really move to the backend and be a filter on the query
  useEffect(() => {
    let foundTokens = [];
    for (var i = 0; i < data?.user?.subscriptions.length; i++) {
      //   console.log(data?.user?.subscriptions[i]);
      if (data?.user?.subscriptions[i]?.creator?.id === url.slice(1)) {
        foundTokens.push(data?.user?.subscriptions[i]);
      }
    }
    setTokens(foundTokens);
  }, [data]);


  return (
    <div>
      <div className={classes.cardsDiv}>
        {tokens.length > 0 ? (
          <CustomGridlist name="OwnedSubTokens">
            {tokens.map((token, i) => (
              <GridListTile key={i} className={classes.cardTile}>
                <OwnedSubCard token={token} className={classes.card} />
              </GridListTile>
            ))}
          </CustomGridlist>
        ) : (
          <div className={classes.blankCard}>
            {/* <BlankBaseTokenCard /> */}
          </div>
        )}
      </div>
    </div>
  );
}
