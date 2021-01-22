import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  makeStyles,
} from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: -theme.spacing(3),
  },
}));

export default function InfoCard() {
  const classes = useStyles();
  return (
    <Card>
      <CardHeader title="Info" className={classes.title} />
      <CardContent>
        <Typography>
          You will be able to upload your own media in the future, but for now
          please borrow some of ours!
        </Typography>
      </CardContent>
    </Card>
  );
}
