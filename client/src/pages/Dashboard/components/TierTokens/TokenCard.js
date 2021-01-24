import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Collapse,
  Typography,
  TextField,
  Grid,
  Avatar,
  FormControlLabel,
  Switch,
  makeStyles,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";
import AvatarIcons, { iconsLength } from "../../../../components/AvatarIcons";

import React, { useEffect, useState } from "react";
import { BigNumber } from "bignumber.js";
import { useSnackbar } from "notistack";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import { useMutation, useReactiveVar } from "@apollo/client";
import { BURN_OR_MODIFY } from "../../../Mint/queries";
import { accountVar, signerVar, subscriptionVar } from "../../../../cache";
import { ethers } from "ethers";

const useStyles = makeStyles((theme) => ({
  edit: {
    marginLeft: "auto",
  },
  item: {
    display: "inline-flex",
    alignItems: "center",
  },
  itemDescription: {
    display: "flex",
    flexDirection: "Column",
    // alignItems: "center",
  },
  itemContainer: {
    marginTop: theme.spacing(1),
  },
  title: {
    marginBottom: -theme.spacing(3),
  },
  numbers: {
    paddingLeft: theme.spacing(3),
  },
  typo: {
    width: 100,
  },
  titleField: {
    flexGrow: 1,
  },
  description: {
    width: "100%",
    // border: "1px solid grey",
    borderRadius: 5,
    padding: theme.spacing(1),
    height: 140,
    overflow: "hidden",
  },
  update: {
    width: "100%",
    backgroundColor: theme.palette.tertiary.main,
  },
  avatar: {
    height: 100,
    width: 100,
    backgroundColor: theme.palette.secondary.main,
  },
  icons: {
    fontSize: "3em",
  },
  arrowIcon: {
    fontSize: "6em",
    color: "black",
    cursor: "pointer",
  },
  avatarItem: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
}));

export default function TokenCard({ tokenProps, nonce }) {
  const classes = useStyles();
  const account = useReactiveVar(accountVar);
  const signer = useReactiveVar(signerVar);
  const subscriptionV1 = useReactiveVar(subscriptionVar);
  const { enqueueSnackbar } = useSnackbar();
  const [expanded, setExpanded] = useState(false);
  const [max, setmax] = useState(false);
  const [changed, setChanged] = useState(false);
  const [token, _setToken] = useState({});
  let [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    description: "",
    onSubmit: null,
    onClose: null,
  });
  const [burnOrModify] = useMutation(BURN_OR_MODIFY);

  useEffect(() => {
    _setToken(tokenProps);
  }, [tokenProps]);

  function closeModal() {
    setConfirmModal({
      open: false,
      title: "",
      description: "",
      onClose: null,
      onSubmit: null,
    });
  }

  const handleExpand = () => {
    if (expanded) {
      _setToken(tokenProps);
    } else {
    }
    setExpanded(!expanded);
  };

  function handleChange(event) {
    onTokenChange(event.target.name, event.target.value);
  }

  function onTokenChange(name, value) {
    let temp = { ...token };
    temp[name] = value;
    _setToken(temp);
    setChanged(true);
  }

  function incIcons() {
    if (token.avatarID < iconsLength) {
      onTokenChange("avatarID", token.avatarID + 1);
    } else {
      onTokenChange("avatarID", 0);
    }
  }

  function decIcons() {
    if (token.avatarID > 0) {
      onTokenChange("avatarID", token.avatarID - 1);
    } else {
      onTokenChange("avatarID", iconsLength);
    }
  }

  const handleQuantChange = () => {
    if (!max) {
      onTokenChange("burn", tokenProps.quantity);
    } else {
      onTokenChange("burn", "0");
    }

    setmax(!max);
  };

  function handleSubmit() {
    let burn = new BigNumber(token.burn);

    if (burn.lt(0)) {
      enqueueSnackbar(`Please enter valid quantity to burn`, {
        variant: "warning",
      });
      return;
    }

    if (token.title === "" || token.description === "") {
      enqueueSnackbar(
        `Please make sure all fields are filled out before modifying`,
        {
          variant: "warning",
        }
      );
      return;
    }

    if (burn.gt(0)) {
      burnDialog();
    } else {
      modifyDialog();
    }
  }

  function burnDialog() {
    setConfirmModal({
      open: true,
      onClose: closeModal,
      onSubmit: _burnOrModify,
      title: "Confirm Modification",
      description: `Next you will be asked to sign a transaction to make changes and burn tokens. Burnt tokens will become permantly unavailable to potential subscribers. This action is irreversible.`,
    });
  }

  function modifyDialog() {
    setConfirmModal({
      open: true,
      onClose: closeModal,
      onSubmit: _burnOrModify,
      title: "Confirm Modification",
      description: `Please confirm your token modifications. `,
    });
  }

  async function _burnOrModify() {
    closeModal();
    let userData = {
      user: account,
      nonce: nonce,
      action: "burn",
    };
    let domain = {
      name: "Qualla Subscription",
      version: "1",
      chainId: process.env.REACT_APP_CHAIN_ID,
      verifyingContract: subscriptionV1.address,
    };

    let creatorTypes = {
      User: [
        { name: "user", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "action", type: "string" },
      ],
    };
    let signature = "";

    const burn = new BigNumber(token.burn);

    if (burn.gt(0)) {
      signature = await signer._signTypedData(domain, creatorTypes, userData);
    }

    burnOrModify({
      variables: {
        baseTokenID: token.id,
        baseTokenTxHash: token.txHash,
        quantity: burn.toFixed(),
        signature,
        title: token?.title,
        description: token?.description,
        avatarID: token?.avatarID?.toString(),
      },
      update(cache) {
        cache.modify({
          id: cache.identify({
            id: token.id,
            __typename: "BaseToken",
          }),
          fields: {
            description() {
              return token.description;
            },
            title() {
              return token.title;
            },
            avatarID() {
              return token.avatarID;
            },
          },
          broadcast: false,
        });

        if (burn.gt(0)) {
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

          let _quantity = new BigNumber(token.quantity);

          cache.modify({
            id: cache.identify({
              id: token.id,
              __typename: "BaseToken",
            }),
            fields: {
              quantity() {
                return _quantity.minus(burn).toFixed();
              },
            },
            broadcast: false,
          });
        }
      },
    })
      .then((res) => {
        enqueueSnackbar(`Request proccessing, check back in a few minutes!`, {
          variant: "success",
        });
        setChanged(false);
        setExpanded(false);
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
        <CardHeader
          title={tokenProps.title}
          subheader={`$ ${ethers.utils.formatEther(
            tokenProps.paymentValue
          )} Dai/Month`}
          className={classes.title}
        />
        <CardContent>
          <Grid container spacing={2} style={{ flexGrow: 1 }}>
            <Grid item xs={12} className={classes.item}>
              <div className={classes.avatarItem}>
                <Avatar className={classes.avatar}>
                  <AvatarIcons
                    customProps={classes.icons}
                    i={tokenProps.avatarID}
                  />
                </Avatar>
              </div>
            </Grid>
            <Grid item xs={12} className={classes.itemDescription}>
              <Typography variant="subtitle2" className={classes.ed}>
                Description:
              </Typography>
              <Typography className={classes.description} variant="h6">
                {tokenProps.description}
              </Typography>
            </Grid>
          </Grid>
          <Grid
            item
            container
            spacing={2}
            xs={12}
            className={classes.itemContainer}
          >
            <Grid item xs={6} className={classes.itemDescription}>
              <Typography>Active Subs</Typography>
              <Typography variant="h4" className={classes.numbers}>
                <b>{tokenProps.activeTokens.length}</b>
              </Typography>
            </Grid>
            <Grid item xs={6} className={classes.itemDescription}>
              <Typography>Quantity Remaining</Typography>
              <Typography variant="h4" className={classes.numbers}>
                <b>
                  {new BigNumber(tokenProps.quantity).gt(10000) ? (
                    <AllInclusiveIcon style={{ fontSize: "2.125rem" }} />
                  ) : (
                    tokenProps.quantity
                  )}
                </b>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button
            className={classes.edit}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={handleExpand}
          >
            {expanded ? "Cancel" : "Edit"}
          </Button>
        </CardActions>
        <Collapse in={expanded} unmountOnExit>
          <CardContent>
            <Grid container spacing={2} style={{ flexGrow: 1 }}>
              <Grid item xs={12} className={classes.item}>
                <Typography className={classes.typo}>Tier Title:</Typography>
                <TextField
                  variant="outlined"
                  name="title"
                  value={token.title}
                  className={classes.titleField}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <Typography className={classes.typo}>Description:</Typography>
                <TextField
                  className={classes.titleField}
                  id="outlined-multiline-static"
                  multiline
                  rows={4}
                  variant="outlined"
                  name="description"
                  onChange={handleChange}
                  value={token.description}
                />
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <Typography className={classes.typo}>Avatar:</Typography>
                <div className={classes.avatarItem}>
                  <KeyboardArrowLeftIcon
                    className={classes.arrowIcon}
                    onClick={decIcons}
                  />
                  <Avatar className={classes.avatar}>
                    <AvatarIcons
                      customProps={classes.icons}
                      i={token.avatarID}
                    />
                  </Avatar>
                  <KeyboardArrowRightIcon
                    className={classes.arrowIcon}
                    onClick={incIcons}
                  />
                </div>
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <Typography className={classes.typo}>Burn:</Typography>
                <TextField
                  disabled={max}
                  variant="outlined"
                  className={classes.titleInput}
                  name="burn"
                  onChange={handleChange}
                  value={max ? "" : token.burn}
                  error={new BigNumber(token?.burn).gt(token?.quantity)}
                  helperText={
                    new BigNumber(token?.burn).gt(token?.quantity)
                      ? "Invalid Quantity."
                      : null
                  }
                />
                <FormControlLabel
                  control={
                    <Switch checked={max} onChange={handleQuantChange} />
                  }
                  label="Max?"
                  labelPlacement="top"
                  className={classes.toggle}
                />
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <Button
                  variant="contained"
                  className={classes.update}
                  onClick={handleSubmit}
                  disabled={!changed}
                >
                  Update
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </Card>
      <ConfirmationModal props={confirmModal} />
    </>
  );
}
