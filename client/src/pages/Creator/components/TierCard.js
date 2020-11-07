import React from "react";
import {TextField, InputAdornment} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2),
  },
}));

export default function TierCard(props) {
  const classes = useStyles();
  const onTierChange = props.onTierChange;

  function handleChange(event) {
    onTierChange(props.num, event.target.name, event.target.value);
  }

  return (
    <Card variant="outlined" className={classes.card}>
      <Grid container component={CardContent} direction="column" spacing={4}>
        <Grid
          item
          name="title"
          component={TextField}
          required
          label="Title"
          defaultValue={props.tier.title}
          onChange={handleChange}
        />
        <Grid
          name="value"
          item
          component={TextField}
          required
          label="Price"
          type="number"
          defaultValue={props.tier.value}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          onChange={handleChange}
        />
        <Grid
          name="perks"
          item
          component={TextField}
          required
          multiline
          id="outlined-multiline-static"
          rows={4}
          label="Perks"
          defaultValue={props.tier.perks}
          variant="outlined"
          onChange={handleChange}
        />
      </Grid>
    </Card>
  );
}
