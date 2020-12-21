import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import Avatar from "@material-ui/core/Avatar";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import AvatarIcons, { iconsLength } from "../../../components/AvatarIcons";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import { cardStyles } from "./styles";

export default function ManageTokenModal(props) {
  const classes = cardStyles();
  const [max, setmax] = useState(false);
  const [toBurn, setToBurn] = useState(0);
  const [token, setToken] = useState(null);

  useEffect(() => {
    let _token = { ...props.token };
    _token.quantity = 0;
    setToken(_token);
  }, [props.open]);

  const handleQuantChange = () => {
    if (!max) {
      onChange("quantity", props.token.quantity);
    } else {
      onChange("quantity", 0);
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

  return (
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
              onChange={handleChange}
              value={token?.quantity}
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
        <Button color="secondary">Update</Button>
      </DialogActions>
    </Dialog>
  );
}
