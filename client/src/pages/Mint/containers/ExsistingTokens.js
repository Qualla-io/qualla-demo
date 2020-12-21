import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Button, GridListTile, Typography } from "@material-ui/core";

import { GET_USER_BASETOKENS } from "../queries";
import { useQueryWithAccount } from "../../../hooks";
import ExsistingTokenCard from "../components/ExsistingTokenCard";
import CustomGridlist from "../../../containers/CustomGridlist";

const useStyles = makeStyles((theme) => ({
  title: {
    marginTop: theme.spacing(6),
  },
  cardsDiv: {
    marginTop: theme.spacing(2),
    marginRight: -140,
    marginLeft: -140,
    paddingTop: theme.spacing(1),
    justifyContent: "space-around",
    overflow: "hidden",
    flexGrow: 1,
  },
}));

export default function ExsistingTokens() {
  const classes = useStyles();
  let { data } = useQueryWithAccount(GET_USER_BASETOKENS);
  return (
    <div>
      <Typography variant="h5" className={classes.title}>
        Exsisting Subscriptions:
      </Typography>
      <div className={classes.cardsDiv}>
        <CustomGridlist name="ExsistingTokens">
          {data?.user?.baseTokens?.map((token, i) => (
            <GridListTile key={i}>
              <ExsistingTokenCard
                token={token}
                i={i}
                // customOnClick={subToken}
                // onTokenChange={onTokenChange}
              />
            </GridListTile>
          ))}
        </CustomGridlist>
      </div>
    </div>
  );
}
