import {
  Grid,
  Typography,
  TextField,
  makeStyles,
  OutlinedInput,
  FormControl,
  InputLabel,
  InputAdornment,
  Select,
  MenuItem,
  Button,
  Avatar,
  ButtonGroup,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import React, { useState } from "react";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import AddIcon from "@material-ui/icons/Add";
import AvatarIcons, { iconsLength } from "../../../../components/AvatarIcons";

const useStyles = makeStyles((theme) => ({
  item: {
    display: "inline-flex",
    alignItems: "center",
  },
  avatarItem: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  typo: {
    width: 100,
  },
  titleField: {
    flexGrow: 1,
  },
  valueInput: {
    minWidth: 125,
  },
  periodInput: {
    minWidth: 125,
  },
  slash: {
    margin: "auto",
  },
  deleteBtn: {
    backgroundColor: "#ef6666",
    width: "50%",
    // height: "100%",
    // paddingLeft: theme.spacing(2),
    color: "#ffffff",
  },
  incBtns: {
    // width: "25%",
  },
  btnItem: {
    marginBottom: theme.spacing(2),
  },
  description: {
    flexGrow: 1,
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
  toggle: {
    marginLeft: theme.spacing(1),
  },
}));

export default function NewTokenCard({
  token,
  i,
  len,
  addToken,
  setI,
  subToken,
  onTokenChange,
}) {
  const classes = useStyles();
  const [max, setmax] = useState(false);
  const [period, setPeriod] = useState(2628000);

  function incIcons() {
    if (token.avatar < iconsLength) {
      onTokenChange(i, "avatar", token.avatar + 1);
    } else {
      onTokenChange(i, "avatar", 0);
    }
  }

  function decIcons() {
    if (token.avatar > 0) {
      onTokenChange(i, "avatar", token.avatar - 1);
    } else {
      onTokenChange(i, "avatar", iconsLength);
    }
  }

  const handleQuantChange = () => {
    if (max) {
      onTokenChange(i, "quantity", 0);
    }
    setmax(!max);
  };

  const handleAddOrNext = () => {
    if (i === len - 1) {
      addToken();
    }
    setI(i + 1);
  };

  const handlePrev = () => {
    setI(i - 1);
  };

  const handleDelete = () => {
    subToken(i);
  };

  const handleChange = (event) => {
    onTokenChange(i, event.target.name, event.target.value);
  };

  return (
    <Grid container direction="column" spacing={2} style={{ flexGrow: 1 }}>
      <Grid item xs={12} className={classes.btnItem}>
        <ButtonGroup style={{ width: "100%" }} size="large">
          <Button
            // color="secondary"
            startIcon={<KeyboardArrowLeftIcon />}
            className={classes.incBtns}
            disabled={i === 0}
            onClick={handlePrev}
          >
            Prev Tier
          </Button>

          <Button className={classes.deleteBtn} onClick={handleDelete}>
            Delete <br /> Tier
          </Button>

          <Button
            // color="secondary"
            endIcon={i === len - 1 ? <AddIcon /> : <KeyboardArrowRightIcon />}
            className={classes.incBtns}
            onClick={handleAddOrNext}
          >
            {i === len - 1 ? "Add Tier" : "Next Tier"}
          </Button>
        </ButtonGroup>
      </Grid>
      <Grid item xs={12} className={classes.item}>
        <Typography className={classes.typo}>Tier Title:</Typography>
        <TextField
          variant="outlined"
          name="title"
          value={token?.title}
          className={classes.titleField}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} className={classes.item}>
        <Typography className={classes.typo}>Value:</Typography>
        <FormControl variant="outlined">
          <InputLabel>Dai</InputLabel>
          <OutlinedInput
            name="value"
            value={token?.value}
            labelWidth={25}
            className={classes.valueInput}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
          />
        </FormControl>
        <Typography variant="h4" className={classes.slash}>
          /
        </Typography>
        <FormControl variant="outlined">
          <InputLabel id="demo-simple-select-filled-label">Period</InputLabel>
          <Select
            labelId="demo-simple-select-filled-label"
            id="demo-simple-select-filled"
            value={period}
            // onChange={handlePeriodChange}
            labelWidth={50}
            className={classes.periodInput}
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
          value={token?.description}
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
            <AvatarIcons customProps={classes.icons} i={token.avatar} />
          </Avatar>
          <KeyboardArrowRightIcon
            className={classes.arrowIcon}
            onClick={incIcons}
          />
        </div>
      </Grid>
      <Grid item xs={12} className={classes.item}>
        <Typography className={classes.typo}>Quantity:</Typography>
        <TextField
          disabled={!max}
          variant="outlined"
          className={classes.titleInput}
          label="Quantity"
          name="quantity"
          onChange={handleChange}
          value={token.quantity}
        />
        <FormControlLabel
          control={<Switch checked={max} onChange={handleQuantChange} />}
          label="Limited Quantity?"
          className={classes.toggle}
        />
      </Grid>
    </Grid>
  );
}
