import React, { useEffect, useState } from "react";
import { BigNumber } from "bignumber.js";
import { useMutation, useReactiveVar } from "@apollo/client";
import { useSnackbar } from "notistack";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import Avatar from "@material-ui/core/Avatar";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DialogTitle from "@material-ui/core/DialogTitle";

import AvatarIcons, { iconsLength } from "../../../components/AvatarIcons";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import { cardStyles } from "./styles";
import { BURN_OR_MODIFY, GET_USER_NONCE } from "../queries";
import { accountVar, signerVar, subscriptionVar } from "../../../cache";
import { useQueryWithAccount } from "../../../hooks";
import ConfirmationModal from "../../../components/ConfirmationModal";

export default function ManageTokenModal(props) {
  const { enqueueSnackbar } = useSnackbar();
  let account = useReactiveVar(accountVar);
  let signer = useReactiveVar(signerVar);
  let subscriptionV1 = useReactiveVar(subscriptionVar);
  const classes = cardStyles();
  const [max, setmax] = useState(false);
  const [token, setToken] = useState(null);
  const { data } = useQueryWithAccount(GET_USER_NONCE);
  const [burnOrModify] = useMutation(BURN_OR_MODIFY);
  let [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    description: "",
    onSubmit: null,
    onClose: null,
  });

  function closeModal() {
    setConfirmModal({
      open: false,
      title: "",
      description: "",
      onClose: null,
      onSubmit: null,
    });
  }

  useEffect(() => {
    let _token = { ...props.token };
    _token.burn = 0;
    setToken(_token);
  }, [props.open]);

  const handleQuantChange = () => {
    if (!max) {
      onChange("burn", props.token.quantity);
    } else {
      onChange("burn", 0);
    }
    setmax(!max);
  };

  function onChange(name, value) {
    let _token = { ...token };
    _token[name] = value;
    setToken(_token);
  }

  function incIcons() {
    if (token.avatarID < iconsLength) {
      onChange("avatarID", token.avatarID + 1);
    } else {
      onChange("avatarID", 0);
    }
  }

  function decIcons() {
    if (token.avatarID > 0) {
      onChange("avatarID", token.avatarID - 1);
    } else {
      onChange("avatarID", iconsLength);
    }
  }

  function handleChange(event) {
    onChange(event.target.name, event.target.value);
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

  function handleSubmit() {
    let burn = new BigNumber(token.burn);
    if (burn.gt(0)) {
      burnDialog();
    } else {
      modifyDialog();
    }
  }

  async function _burnOrModify() {
    closeModal();
    let userData = {
      user: account,
      nonce: data?.user?.nonce,
      action: "burn",
    };
    let domain = {
      name: "Qualla Subscription",
      version: "1",
      chainId: 31337,
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

    let burn = new BigNumber(token.burn);

    if (burn.gt(0)) {
      signature = await signer._signTypedData(domain, creatorTypes, userData);
    }

    burnOrModify({
      variables: {
        baseTokenID: token.id,
        baseTokenTxHash: token.txHash,
        quantity: burn.toFixed(),
        signature,
        title: token.title,
        description: token.description,
        avatarID: token.avatarID.toString(),
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
      })
      .catch((err) => {
        enqueueSnackbar(`${err}`, {
          variant: "error",
        });
      });

    props.handleClose();
  }

  return (
    <>
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Manage Tokens</DialogTitle>
        <DialogContent dividers>
          <div className={classes.avatarSelection}>
            <KeyboardArrowLeftIcon
              className={classes.arrowIcon}
              onClick={decIcons}
            />
            <Avatar className={classes.avatar}>
              <AvatarIcons customProps={classes.icons} i={token?.avatarID} />
            </Avatar>
            <KeyboardArrowRightIcon
              className={classes.arrowIcon}
              onClick={incIcons}
            />
          </div>
          <TextField
            variant="outlined"
            className={classes.titleInput}
            label="Title"
            name="title"
            onChange={handleChange}
            value={token?.title}
          />
          <TextField
            className={classes.description}
            id="outlined-multiline-static"
            label="Description"
            multiline
            rows={4}
            variant="outlined"
            name="description"
            onChange={handleChange}
            value={token?.description}
          />
          <div className={classes.dollarSection}>
            {props.token.quantity > 100000 ? null : (
              <TextField
                disabled={max}
                variant="outlined"
                className={classes.titleInput}
                label="Burn"
                name="burn"
                type="number"
                onChange={handleChange}
                value={token?.burn}
                error={new BigNumber(token?.burn).gt(token?.quantity)}
                helperText={
                  new BigNumber(token?.burn).gt(token?.quantity)
                    ? "Invalid Quantity."
                    : null
                }
              />
            )}

            <FormControlLabel
              control={<Switch checked={max} onChange={handleQuantChange} />}
              label="Burn All?"
              className={classes.toggle}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus color="secondary" onClick={props.handleClose}>
            Cancel
          </Button>
          <Button color="secondary" onClick={handleSubmit}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmationModal props={confirmModal} />
    </>
  );
}
