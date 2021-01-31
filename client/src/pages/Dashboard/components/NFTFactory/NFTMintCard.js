import React, { useState } from "react";
import { useSnackbar } from "notistack";
import { useMutation, useReactiveVar } from "@apollo/client";

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  TextField,
  makeStyles,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  FormLabel,
  FormHelperText,
  CardActions,
  Button,
} from "@material-ui/core";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";

import { accountVar, signerVar } from "../../../../cache";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import NFTgifs, { gifLength } from "../../../../components/NFTgifs";
import { MINT_NFT } from "./queries";

const useStyles = makeStyles((theme) => ({
  supermain: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
  },
  main: {
    flexGrow: 1,
  },
  header: {
    marginBottom: -theme.spacing(3),
  },
  item: {
    display: "inline-flex",
    alignItems: "center",
  },
  typo: {
    width: 100,
  },
  description: {
    flexGrow: 1,
  },
  titleField: {
    flexGrow: 1,
  },
  formControl: {
    marginTop: theme.spacing(2),
    // marginLeft: 100,
  },
  btn: {
    backgroundColor: theme.palette.tertiary.main,
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  arrowIcon: {
    fontSize: "6em",
    color: "black",
    cursor: "pointer",
  },
  gifItem: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
}));

export default function NFTMintCard({ user, baseTokens }) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  let account = useReactiveVar(accountVar);
  let signer = useReactiveVar(signerVar);
  let [nft, setNft] = useState({
    name: "",
    description: "",
    baseTokens: [],
    gifIndex: 0,
  });
  let [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    description: "",
    onSubmit: null,
    onClose: null,
  });
  let [mintNFT] = useMutation(MINT_NFT);

  function closeConfirm() {
    setConfirmModal({
      open: false,
      title: "",
      description: "",
      onClose: null,
      onSubmit: null,
    });
  }

  console.log(baseTokens);

  function updateNFT(name, value) {
    let temp = { ...nft };
    temp[name] = value;
    setNft(temp);
  }

  function handleChange(event) {
    updateNFT(event.target.name, event.target.value);
  }
  function handleCheckChange(event) {
    let temp = { ...nft };
    if (event.target.checked) {
      temp.baseTokens.push(event.target.name);
    } else {
      let index = nft.baseTokens.indexOf(event.target.name);
      temp.baseTokens.splice(index, 1);
    }
    setNft(temp);
  }

  function incGif() {
    if (nft.gifIndex < gifLength) {
      updateNFT("gifIndex", nft.gifIndex + 1);
    } else {
      updateNFT("gifIndex", 0);
    }
  }

  function decGif() {
    if (nft.gifIndex > 0) {
      updateNFT("gifIndex", nft.gifIndex - 1);
    } else {
      updateNFT("gifIndex", gifLength);
    }
  }

  async function _mintNFT() {
    setConfirmModal({
      open: true,
      onClose: closeConfirm,
      onSubmit: _onMint,
      title: "Mint NFT?",
      description: `Please sign the following message to mint your NFT. It will become available for your subscribers to redeem immediately.`,
    });
  }

  async function _onMint() {
    closeConfirm();

    let userData = {
      user: account,
      nonce: user?.nonce,
      action: "nft",
    };

    let domain = {
      name: "Qualla Subscription",
      version: "1",
      chainId: process.env.REACT_APP_CHAIN_ID,
      verifyingContract: process.env.REACT_APP_GRAPHQL_SUB_CONTRACT,
    };

    let creatorTypes = {
      User: [
        { name: "user", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "action", type: "string" },
      ],
    };

    let signature = await signer._signTypedData(domain, creatorTypes, userData);

    mintNFT({
      variables: {
        userID: account,
        signature,
        title: nft.title,
        description: nft.description,
        gifIndex: nft.gifIndex,
        baseTokens: nft.baseTokens,
      },
      update(cache) {
        cache.modify({
          id: cache.identify({
            id: account.toLowerCase(),
            __typename: "User",
          }),
          fields: {
            nonce(cachedNonce) {
              return cachedNonce + 1;
            },
          },
          broadcast: false,
        });
      },
    })
      .then((res) => {
        enqueueSnackbar(`Request proccessing, check back in a few minutes!`, {
          variant: "success",
        });
      })
      .catch((err) => {
        enqueueSnackbar(`${err}`, {
          variant: "error",
        });
      });
  }

  return (
    <>
      <Card>
        <CardHeader title="Mint New NFT" className={classes.header} />
        <CardContent>
          <Grid
            container
            direction="row"
            spacing={2}
            className={classes.supermain}
          >
            <Grid item xs={12} lg={7}>
              <Grid
                container
                direction="column"
                spacing={2}
                className={classes.main}
              >
                <Grid item xs={12} className={classes.item}>
                  <Typography className={classes.typo}>Name:</Typography>
                  <TextField
                    variant="outlined"
                    name="title"
                    value={nft.title}
                    className={classes.titleField}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <Typography className={classes.typo}>Description:</Typography>
                  <TextField
                    className={classes.description}
                    id="outlined-multiline-static"
                    multiline
                    rows={4}
                    variant="outlined"
                    name="description"
                    onChange={handleChange}
                    value={nft.description}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <Typography className={classes.typo}>
                    Airdrop <br /> To Tiers:
                  </Typography>
                  {baseTokens?.length > 0 ? (
                    <>
                      <FormControl
                        component="fieldset"
                        className={classes.formControl}
                      >
                        {/* <FormLabel component="legend">
                        Tiers to distribute to:
                      </FormLabel> */}
                        <FormGroup>
                          {baseTokens.map((token, i) => (
                            <FormControlLabel
                              key={i}
                              control={
                                <Checkbox
                                  checked={nft.baseTokens.includes(token.id)}
                                  onChange={handleCheckChange}
                                  name={`${token.id}`}
                                />
                              }
                              label={`${token.title}: (${token.activeTokens.length} active subscribers)`}
                            />
                          ))}
                        </FormGroup>
                        {/* <FormHelperText>Be careful</FormHelperText> */}
                      </FormControl>
                    </>
                  ) : (
                    <Typography className={classes.formControl}>
                      Please mint Tier Tokens before distributing NFTs
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={5} container direction="column" spacing={2}>
              <Grid item xs={12} className={classes.main}>
                <div className={classes.gifItem}>
                  <KeyboardArrowLeftIcon
                    className={classes.arrowIcon}
                    onClick={decGif}
                  />
                  <NFTgifs i={nft.gifIndex} />
                  <KeyboardArrowRightIcon
                    className={classes.arrowIcon}
                    onClick={incGif}
                  />
                </div>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions style={{ flexGrow: 1 }}>
          <div style={{ margin: "auto" }} />
          <Button
            disabled={
              !nft.title || !nft.description || nft.baseTokens.length == 0
            }
            variant="contained"
            className={classes.btn}
            onClick={_mintNFT}
          >
            Mint NFT
          </Button>
        </CardActions>
      </Card>
      <ConfirmationModal props={confirmModal} />
    </>
  );
}
