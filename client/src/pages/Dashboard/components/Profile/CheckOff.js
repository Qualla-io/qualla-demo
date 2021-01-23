import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import React from "react";

import DoneIcon from "@material-ui/icons/Done";
import PriorityHighIcon from "@material-ui/icons/PriorityHigh";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  done: {
    backgroundColor: theme.palette.tertiary.main,
  },
  notDone: {
    backgroundColor: "#ef6666",
  },
  icon: {
    color: "#000000",
  },
  title: {
    marginBottom: -theme.spacing(3),
  },
}));

export default function CheckOff({ userProps }) {
  const classes = useStyles();
  const check = [
    { title: "Pick a Username", checked: userProps.username },
    { title: "Set Your Url", checked: userProps.url },
    { title: "Describe Your Profile", checked: userProps.description },
    { title: "Choose an Avatar", checked: userProps.avatar !== null },
    { title: "Choose a Cover Photo", checked: userProps.coverPhoto !== null },
  ];

  console.log(userProps);
  return (
    <Card>
      <CardHeader title="Checklist" className={classes.title} />
      <CardContent>
        <List>
          {check.map((item, i) => (
            <ListItem>
              <ListItemAvatar>
                <Avatar
                  className={item.checked ? classes.done : classes.notDone}
                >
                  {item.checked ? (
                    <DoneIcon className={classes.icon} />
                  ) : (
                    <PriorityHighIcon className={classes.icon} />
                  )}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={item.title} />
            </ListItem>
          ))}
          <ListItem button component={Link} to="/dashboard/tiers">
            <ListItemAvatar>
              <Avatar
                className={userProps.baseTokens ? classes.done : classes.notDone}
              >
                {userProps.baseTokens ? (
                  <DoneIcon className={classes.icon} />
                ) : (
                  <PriorityHighIcon className={classes.icon} />
                )}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Mint Tier Tokens"
              secondary={userProps?.baseTokens ? `Manage Tokens>` : `Mint Now >`}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}
