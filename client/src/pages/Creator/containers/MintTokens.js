import React, { useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Button, GridListTile, Typography } from "@material-ui/core";
import CustomGridlist from "../../../containers/CustomGridlist";
import AddTokenCard from "../components/AddTokenCard";
import NewTokenCard from "../components/NewTokenCard";

const useStyles = makeStyles((theme) => ({
  title: {
    marginTop: theme.spacing(2),
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

export default function MintTokens() {
  const [tokens, setTokens] = useState([]);
  const classes = useStyles();
  function addToken() {
    setTokens([...tokens, { title: "", value: "", description: "" }]);
  }

  function subToken(key) {
    console.log(key);
    console.log(tokens);
    let _tokens = [...tokens];
    console.log(_tokens.splice(key, 1));
    console.log(_tokens);
    setTokens(_tokens);
  }

  function onTokenChange(key, name, value) {
    let temp = [...tokens];
    let _token = temp[key];
    _token[name] = value;
    temp[key] = _token;
    setTokens(temp);
  }

  async function _mintBatch() {}

  async function _mintOne() {}

  function _onMint() {
    if (tokens.length > 1) {
      _mintBatch();
    } else {
      _mintOne();
    }
  }

  return (
    <div>
      <Typography variant="h5" className={classes.title}>
        Mint Subscriptions:
      </Typography>
      <div className={classes.cardsDiv}>
        <CustomGridlist name="MintingTokens">
          {tokens.map((token, i) => (
            <GridListTile key={i}>
              <NewTokenCard
                token={token}
                i={i}
                customOnClick={subToken}
                onTokenChange={onTokenChange}
              />
            </GridListTile>
          ))}
          <GridListTile>
            <AddTokenCard customOnClick={addToken} />
          </GridListTile>
        </CustomGridlist>
      </div>
      <div style={{ display: "flex" }}>
        {/* To justify button right: */}
        {/* <div style={{ margin: "auto" }} /> */}
        {tokens.length > 0 ? (
          <Button variant="contained" color="secondary">
            Mint
          </Button>
        ) : null}
      </div>
    </div>
  );
}
