import { Card, CardContent, CardHeader, makeStyles } from "@material-ui/core";
import React from "react";
import Message from "./Message";

const useStyles = makeStyles((theme) => ({
  card: { height: 420, overflow: "hidden" },
  title: {
    marginBottom: -theme.spacing(3),
  },
}));

const defaultMessage = [
  {
    title: "Welcome to Qualla!",
    body:
      "Welcome to the Qualla demo! Please send us any feedback you have or join our discord using the action button below.",
  },
];

export default function Messages() {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardHeader title="Messages" className={classes.title} />
      <CardContent className={classes.content}>
        {defaultMessage.map((msg, index) => (
          <Message title={msg.title} body={msg.body} key={index} />
        ))}
      </CardContent>
    </Card>
  );
}
