import React, {useState} from "react";

import {makeStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {Button, Typography} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

import TeirCard from "./TeirCard";

const initTeirs = [
  {title: "Teir 1", value: "5", perks: "add free"},
  {title: "Teir 2", value: "10", perks: "early access"},
];

const useStyles = makeStyles((theme) => ({
  header: {
    marginBottom: theme.spacing(4),
  },
}));

export default function CreatorLaunchCard() {
  const classes = useStyles();
  const [teirs, setTeirs] = useState(initTeirs);

  function addTeir() {
    setTeirs([...teirs, {}]);
  }

  function subTeir() {
    setTeirs(teirs.slice(0, teirs.length - 1));
  }

  return (
    <Grid container alignItems="stretch">
      <Grid Item component={Card} xs={10}>
        <CardContent>
          <Typography variant="h6" className={classes.header}>
            Teirs
          </Typography>
          <Grid container spacing={5} justify="center" alignItems="center">
            {teirs.map((teir, i) => (
              <TeirCard key={i} props={teir} />
            ))}
            <Grid item component={Card} variant="outlined">
              <Grid container component={CardContent} direction="column">
                <Button
                  style={{flexShrink: 1}}
                  variant="outlined"
                  color="primary"
                  onClick={addTeir}
                >
                  <AddIcon fontSize="Large" />
                  Add Teir
                </Button>
                <Button
                  style={{flexShrink: 1}}
                  variant="outlined"
                  color="primary"
                  onClick={subTeir}
                >
                  <RemoveIcon fontSize="Large" />
                  Remove Teir
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Grid>
    </Grid>
  );
}
