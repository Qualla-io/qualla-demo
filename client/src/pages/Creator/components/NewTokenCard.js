import React, { useState } from "react";
import { cardStyles } from "./styles";

import { Avatar, Typography, Button, TextField } from "@material-ui/core";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import AvatarIcons, { iconsLength } from "../../../components/AvatarIcons";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";


export default function NewTokenCard(props) {
  const classes = cardStyles();
  const [max, setmax] = useState(false);
  const [iconNum, setIconNum] = useState(0);
  const [period, setPeriod] = useState(2628000);


  function incIcons() {
    if (props.token.avatar < iconsLength) {
      props.onTokenChange(props.i, "avatar", props.token.avatar + 1);
    } else {
      props.onTokenChange(props.i, "avatar", 0);
    }
  }

  function decIcons() {
    if (props.token.avatar > 0) {
      props.onTokenChange(props.i, "avatar", props.token.avatar - 1);
    } else {
      props.onTokenChange(props.i, "avatar", iconsLength);
    }
  }

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  const handleQuantChange = () => {
    if (max) {
      props.onTokenChange(props.i, "quantity", 0);
    }
    setmax(!max);
  };

  function _customOnClick() {
    props.customOnClick(props.i);
  }

  function handleChange(event) {
    props.onTokenChange(props.i, event.target.name, event.target.value);
  }

  return (
    <div className={classes.newCard}>
      <div className={classes.avatarTitle}>
        <Typography variant="h6">Token Avatar:</Typography>
        <div style={{ margin: "auto" }} />
        <Button color="secondary" onClick={_customOnClick}>
          X
        </Button>
      </div>
      <div className={classes.avatarSelection}>
        <KeyboardArrowLeftIcon
          className={classes.arrowIcon}
          onClick={decIcons}
        />
        <Avatar className={classes.avatar}>
          <AvatarIcons customProps={classes.icons} i={props.token.avatar} />
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
        value={props.token.title}
      />
      <div className={classes.dollarSection}>
        <FormControl className={classes.dollarInput} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">Dai</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            // value={values.amount}
            onChange={handleChange}
            type="number"
            name="value"
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            labelWidth={25}
            value={props.token.value}
          />
        </FormControl>
        <Typography variant="h4" className={classes.slash}>
          /
        </Typography>
        <FormControl variant="outlined" className={classes.periodInput}>
          <InputLabel id="demo-simple-select-filled-label">Period</InputLabel>
          <Select
            labelId="demo-simple-select-filled-label"
            id="demo-simple-select-filled"
            value={period}
            onChange={handlePeriodChange}
            labelWidth={50}
          >
            <MenuItem value={2628000}>Month</MenuItem>
            <MenuItem value={7884000} disabled>
              3 Months
            </MenuItem>
            <MenuItem value={15770000} disabled>
              6 Months
            </MenuItem>
            <MenuItem value={31540000} disabled>
              1 Year
            </MenuItem>
          </Select>
        </FormControl>
      </div>
      <TextField
        className={classes.description}
        id="outlined-multiline-static"
        label="Description"
        multiline
        rows={4}
        variant="outlined"
        name="description"
        onChange={handleChange}
        value={props.token.description}
      />
      <div className={classes.dollarSection}>
        <TextField
          disabled={!max}
          variant="outlined"
          className={classes.titleInput}
          label="Quantity"
          name="quantity"
          onChange={handleChange}
          value={props.token.quantity}
        />
        <FormControlLabel
          control={<Switch checked={max} onChange={handleQuantChange} />}
          label="Limited Quantity?"
          className={classes.toggle}
        />
      </div>
    </div>
  );
}
