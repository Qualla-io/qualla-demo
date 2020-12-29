import React, { useEffect, useState } from "react";

import { GridListTile } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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

export default function OwnedTokens(props) {
  const classes = useStyles();
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    setTokens(props.tokens);
  }, [props.tokens]);

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
