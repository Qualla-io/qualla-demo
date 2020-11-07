import React from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2),
  },
  month: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  perksHead: {
    paddingBottom: theme.spacing(1),
  },
  value: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    borderRadius: 25,
    margin: -theme.spacing(2),
  },
  btnGrid: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function TierCard(props) {
  const classes = useStyles();
  const onSubscribe = props.onSubscribe;

  function handleClick() {
    onSubscribe(props.num);
  }

  return (
    <Card variant="outlined" className={classes.card}>
      <Grid container component={CardContent} direction="column" spacing={4}>
        <Grid item component={Typography} variant="h5">
          {props.tier.title}
        </Grid>
        <Grid item>
          <Typography className={classes.value} variant="h4">
            ${props.tier.value}{" "}
          </Typography>
          <Typography className={classes.month}>dai / month</Typography>
        </Grid>
        <Grid item className={classes.btnGrid}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleClick}
            className={classes.btn}
            size="large"
          >
            Subscribe
          </Button>
        </Grid>
        <Grid item>
          <Typography variant="h6" className={classes.perksHead}>
            Perks:
          </Typography>
          <Typography>{props.tier.perks}</Typography>
        </Grid>
      </Grid>
    </Card>
  );
}
