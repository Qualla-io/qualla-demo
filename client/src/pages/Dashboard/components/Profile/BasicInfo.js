import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles((theme) => ({
  description: { marginRight: theme.spacing(2), width: 100 },
  textfield: {
    flexGrow: 1,
    textAlign: "center",
  },
}));

export default function BasicInfo({ onPropsChange, userProps }) {
  const classes = useStyles();

  function handleChange(event) {
    onPropsChange(event.target.name, event.target.value);
  }

  return (
    <Card>
      <CardHeader title="User Details" />
      <CardContent>
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={2}
        >
          <Grid
            item
            xs
            container
            direction="row"
            justify="left"
            alignItems="center"
            style={{ display: "flex" }}
          >
            <Typography className={classes.description}>Username:</Typography>

            <TextField
              required
              variant="filled"
              label="Required"
              name="username"
              onChange={handleChange}
              className={classes.textfield}
              value={userProps.username}
            />
          </Grid>
          <Grid
            item
            xs
            container
            direction="row"
            justify="left"
            alignItems="center"
            style={{ display: "flex" }}
          >
            <Typography className={classes.description}>Qualla url:</Typography>
            <Typography>qualla.io/</Typography>
            <TextField
              variant="filled"
              name="url"
              onChange={handleChange}
              className={classes.textfield}
              value={userProps.url}
            />
          </Grid>
          <Grid
            item
            xs
            container
            direction="row"
            justify="left"
            alignItems="center"
            style={{ display: "inline-flex" }}
          >
            <Typography className={classes.description}>
              Profile description:
            </Typography>
            <TextField
              variant="filled"
              name="description"
              multiline
              rows={4}
              onChange={handleChange}
              className={classes.textfield}
              value={userProps.description}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
