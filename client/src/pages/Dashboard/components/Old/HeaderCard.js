import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  card: {
    backgroundColor: "#fff",
    maxWidth: 250,
  },
  content: {
    display: "flex",
    flexDirection: "Column",
    justifyContent: "center",
  },
  value: {
    display: "flex",
    alignItems: "center",
  },
}));

export default function HeaderCard({ description, value = "0" }) {
  const classes = useStyles();
  return (
    <>
      <Card className={classes.card}>
        <CardContent className={classes.content}>
          <Typography>{description}</Typography>
          <div classeName={classes.value}>
            <Typography variant="h4">{value}</Typography>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
