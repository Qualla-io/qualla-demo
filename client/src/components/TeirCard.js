import React from "react";
import {Button, Typography, TextField, InputAdornment} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

export default function TeirCard(props) {

  return (
    <Grid item component={Card} variant="outlined">
      <Grid container component={CardContent} direction="column" spacing={4}>
        <Grid
          item
          component={TextField}
          required
          id="standard-required"
          label="Title"
          defaultValue={props.props.title}
        />
        <Grid
          item
          component={TextField}
          required
          id="standard-required"
          label="Price"
          type="number"
          defaultValue={props.props.value}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
        <Grid
          item
          component={TextField}
          required
          multiline
          id="outlined-multiline-static"
          rows={4}
          label="Perks"
          defaultValue={props.props.perks}
          variant="outlined"
        />
      </Grid>
    </Grid>
  );
}
